import requests
import time
import json
from decimal import Decimal
from datetime import datetime
import logging
import pandas as pd
from binance.client import Client
import mysql.connector

# Thiết lập logging
logging.basicConfig(level=logging.INFO)

# Kết nối đến MySQL
db_connection = mysql.connector.connect(
    host="database",  # Tên dịch vụ MySQL trong Docker Compose
    user="root",
    password="password",
    database="crypto_db"
)
cursor = db_connection.cursor()

API_KEY = 'QazS8hMu4kK0SUGIuAJYD1RRJYRHA3wAeBwfRCcLUP3Yc9maH8DmBGloCQ46ohHm'
API_SECRET = 'mcK4w9YckLLavlDpnsxvjyYXqaF14ZznFss4UIKlszKpcxSvf9ufKY3kfZ3VdkpE'

# Khởi tạo client Binance
client = Client(api_key=API_KEY, api_secret=API_SECRET)

# Hàm lấy dữ liệu thô từ API 5 năm trước  
def get_historical_data(symbol, start_date, end_date, interval='1d'):
    try:
        klines = client.get_historical_klines(
            symbol=symbol,
            interval=interval,
            start_str=start_date,
            end_str=end_date
        )
        return klines
    except Exception as e:
        logging.error(f"Error fetching historical data for {symbol}: {str(e)}")
        return None



def prepare_historical_data(klines, symbol):
    try:
        data_list = []
        for index, kline in enumerate(klines):
            try:
                open_price = float(kline[1])
                close_price = float(kline[4])
                high_price = float(kline[2])
                low_price = float(kline[3])
                total_volume = float(kline[5])
                buy_volume = float(kline[7])  # takerBuyBaseAssetVolume
                sell_volume = total_volume - buy_volume

                data = {
                    'symbol': symbol,
                    'priceChange': close_price - open_price,  # Giá thay đổi theo thời gian (close - open)
                    'priceChangePercent': (close_price - open_price) / open_price * 100 if open_price != 0 else 0,
                    'weightedAvgPrice': open_price,  # Giá trung bình giao dịch (có thể cần điều chỉnh)
                    'lastPrice': close_price,  # Giá đóng cửa
                    'openPrice': open_price,
                    'highPrice': high_price,
                    'lowPrice': low_price,
                    'volume': total_volume,
                    'quoteVolume': float(kline[7]),  # Khối lượng giao dịch tính theo quote
                    'buyVolume': buy_volume,
                    'sellVolume': sell_volume,
                    'timestamp': pd.to_datetime(kline[0], unit='ms').isoformat()
                }
                data_list.append(data)
            except (ValueError, TypeError) as e:
                logging.error(f"Error processing kline data at index {index}: {str(e)}")
                continue  # Bỏ qua kline này nếu có lỗi

        return data_list  # Trả về danh sách các đối tượng data
    except Exception as e:
        logging.error(f"Error preparing historical data: {str(e)}")
        return None

# Hàm lấy dữ liệu thô từ API
def get_raw_data(symbol):
    try:
        ticker_info = client.get_ticker(symbol=symbol)
        return ticker_info
    except Exception as e:
        logging.error(f"Error getting raw data for {symbol}: {str(e)}")
        return None

# Hàm chuẩn bị dữ liệu
def prepare_data(raw_data):
    try:
        # Đảm bảo các trường có mặt trong raw_data trước khi sử dụng
        buy_volume = Decimal(raw_data.get('takerBuyBaseAssetVolume', 0))
        total_volume = Decimal(raw_data.get('volume', 0))
        sell_volume = total_volume - buy_volume

        data = {
            'symbol': raw_data.get('symbol', ''),
            'priceChange': float(Decimal(raw_data.get('priceChange', 0))),
            'priceChangePercent': float(Decimal(raw_data.get('priceChangePercent', 0))),
            'weightedAvgPrice': float(Decimal(raw_data.get('weightedAvgPrice', 0))),
            'lastPrice': float(Decimal(raw_data.get('lastPrice', 0))),
            'openPrice': float(Decimal(raw_data.get('openPrice', 0))),
            'highPrice': float(Decimal(raw_data.get('highPrice', 0))),
            'lowPrice': float(Decimal(raw_data.get('lowPrice', 0))),
            'volume': float(total_volume),
            'quoteVolume': float(Decimal(raw_data.get('quoteVolume', 0))),
            'buyVolume': float(buy_volume),
            'sellVolume': float(sell_volume),
            'timestamp': pd.to_datetime('now').isoformat()  # Cần thay đổi nếu muốn timestamp từ raw_data
        }
        return data
    except Exception as e:
        logging.error(f"Error preparing data: {str(e)}")
        return None


# Hàm chèn dữ liệu vào cơ sở dữ liệu
def insert_to_db(data):
    url = "http://database_api:5000/insert"  # Sử dụng tên dịch vụ trong Docker Compose
    try:
        response = requests.post(url, json=data)
        if response.status_code == 201:
            logging.info("Data inserted successfully.")
        else:
            logging.error(f"Failed to insert data: {response.json()}")
    except Exception as e:
        logging.error(f"Error inserting data: {str(e)}")

# Hàm chính để thu thập dữ liệu
def main():
    symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"]
    end_date = pd.to_datetime('now').isoformat()
    start_date = (pd.to_datetime('now') - pd.DateOffset(years=5)).isoformat()

    # Lấy dữ liệu lịch sử
    for symbol in symbols:
        historical_data = get_historical_data(symbol, start_date, end_date)
        if historical_data:
            data_list = prepare_historical_data(historical_data, symbol)
            if data_list:
                for data in data_list:
                    insert_to_db(data)

    while True:
        start_time = time.time()
        for symbol in symbols:
            raw_data = get_raw_data(symbol)
            if raw_data:
                data = prepare_data(raw_data)
                if data:
                    insert_to_db(data)

        end_time = time.time()
        logging.info(f"Data collection took {end_time - start_time} seconds.")
        time.sleep(30)  # Thời gian giữa các lần gọi API

if __name__ == "__main__":
    main()
