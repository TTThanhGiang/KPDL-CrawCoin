from flask import Flask, request, jsonify
from flask_cors import CORS
import pytz
from datetime import datetime
import decimal

import mysql.connector

app = Flask(__name__)
CORS(app)

# Kết nối đến MySQL
db_connection = mysql.connector.connect(
    host="database",  # Tên dịch vụ trong docker-compose
    user="root",
    password="password",
    database="crypto_db"
)
cursor = db_connection.cursor()


@app.route('/insert', methods=['POST'])
def insert_data():
    data = request.json
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data format"}), 400

    try:
        cursor.execute(
            """
            INSERT INTO coin_data (symbol, priceChange, priceChangePercent, weightedAvgPrice, 
                lastPrice, openPrice, highPrice, lowPrice, volume, quoteVolume, 
                buyVolume, sellVolume, time) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                data['symbol'], data.get('priceChange', 0), data.get('priceChangePercent', 0),
                data.get('weightedAvgPrice', 0), data.get('lastPrice', 0), data.get('openPrice', 0), 
                data.get('highPrice', 0), data.get('lowPrice', 0), data.get('volume', 0), data.get('quoteVolume', 0),
                data.get('buyVolume', 0), data.get('sellVolume', 0),
                data['timestamp']
            )
        )
        db_connection.commit()
        return jsonify({"message": "Data inserted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/healthcheck', methods=['GET'])
def health_check():
    try:
        cursor.execute("SELECT 1")
        return jsonify({"status": "healthy"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.route('/data', methods=['GET'])
def get_data():
    try:
        vietnam_timezone = pytz.timezone('Asia/Ho_Chi_Minh')
        cursor.execute("SELECT * FROM coin_data")  # Truy vấn lấy dữ liệu từ bảng
        rows = cursor.fetchall()
        data = []
        for row in rows:
            # Chuyển đổi thời gian từ UTC sang múi giờ Việt Nam
            time_utc = row[13]  # Giả sử đây là giá trị thời gian từ DB
            if isinstance(time_utc, datetime):  # Kiểm tra nếu là kiểu datetime
                time_vietnam = time_utc.astimezone(vietnam_timezone)
            else:
                time_vietnam = time_utc  # Nếu không phải datetime thì giữ nguyên (cần xử lý thêm nếu cần)

            data.append({
                'id': row[0],
                'symbol': row[1],
                'priceChange': row[2],
                'priceChangePercent': row[3],
                'weightedAvgPrice': row[4],
                'lastPrice': row[5],
                'openPrice': row[6],
                'highPrice': row[7],
                'lowPrice': row[8],
                'volume': row[9],
                'quoteVolume': row[10],
                'buyVolume': row[11],
                'sellVolume': row[12],
                'time': time_vietnam.isoformat()  # Chuyển đổi về định dạng ISO string
            })
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
