from flask import Flask, jsonify
import pandas as pd
import numpy as np
import mysql.connector
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Kết nối database
db_connection = mysql.connector.connect(
    host="database",
    user="root",
    password="password",
    database="crypto_db"
)

def fetch_raw_data():
    """Lấy dữ liệu từ database."""
    query = "SELECT * FROM coin_data"
    df = pd.read_sql(query, db_connection)

    # Chuyển các cột kiểu object thành kiểu float
    numeric_columns = ['priceChange', 'priceChangePercent', 'weightedAvgPrice', 'lastPrice',
                    'openPrice', 'highPrice', 'lowPrice', 'volume', 'quoteVolume', 
                    'buyVolume', 'sellVolume']
    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df['time'] = pd.to_datetime(df['time'])
    # Xóa các cột 'openTime' và 'closeTime'
    df = df.drop(columns=['openTime', 'closeTime'])
    return df

def process_time_series_data(df, freq):
    """Xử lý dữ liệu theo thời gian."""
    df = df.set_index('time')  # Đặt 'time' làm index
    resampled = df.resample(freq).mean()  # Resample dữ liệu (ngày, tuần, tháng)
    return resampled.reset_index()

@app.route('/daily_data/<symbol>', methods=['GET'])
def get_daily_data(symbol):
    """Trả về dữ liệu ngày cho đồng coin."""
    raw_data = fetch_raw_data()
    df_symbol = raw_data[raw_data['symbol'] == symbol]
    df_resample = df_symbol.drop(columns=['symbol', 'buyVolume', 'sellVolume', 'id'])
    daily_data = process_time_series_data(df_resample, 'D')
    daily_data_list = daily_data.to_dict(orient='records')
    return jsonify(daily_data_list)

@app.route('/weekly_data/<symbol>', methods=['GET'])
def get_weekly_data(symbol):
    """Trả về dữ liệu tuần cho đồng coin."""
    raw_data = fetch_raw_data()
    df_symbol = raw_data[raw_data['symbol'] == symbol]
    df_resample = df_symbol.drop(columns=['symbol', 'buyVolume', 'sellVolume', 'id'])
    weekly_data = process_time_series_data(df_resample, 'W')
    weekly_data_list = weekly_data.to_dict(orient='records')
    return jsonify(weekly_data_list)

@app.route('/monthly_data/<symbol>', methods=['GET'])
def get_monthly_data(symbol):
    """Trả về dữ liệu tháng cho đồng coin."""
    raw_data = fetch_raw_data()
    df_symbol = raw_data[raw_data['symbol'] == symbol]
    df_resample = df_symbol.drop(columns=['symbol', 'buyVolume', 'sellVolume', 'id'])
    monthly_data = process_time_series_data(df_resample, 'M')
    monthly_data_list = monthly_data.to_dict(orient='records')
    return jsonify(monthly_data_list)

@app.route('/correlation_matrix/<symbol>', methods=['GET'])
def get_correlation_matrix(symbol):
    """Trả về ma trận tương quan cho đồng coin."""
    raw_data = fetch_raw_data()
    df_symbol = raw_data[raw_data['symbol'] == symbol]
    df_symbol = df_symbol.drop(columns=['symbol', 'time', 'id'])
    correlation_matrix = df_symbol.corr()
    correlation_data = correlation_matrix.to_dict()
    return jsonify(correlation_data)

@app.route('/seasonal_analysis/<symbol>', methods=['GET'])
def get_seasonal_analysis(symbol):
    """Trả về phân tích seasonal cho đồng coin."""
    raw_data = fetch_raw_data()
    df_symbol = raw_data[raw_data['symbol'] == symbol]
    df_symbol = df_symbol.drop(columns=['symbol', 'id'])
    yearly_data = df_symbol.resample('Y', on='time').mean().reset_index()
    seasonal_data_list = yearly_data.to_dict(orient='records')
    return jsonify(seasonal_data_list)


def prepare_data(df):
    df['dayofyear'] = df['time'].dt.dayofyear  # Trích xuất ngày trong năm
    df['year'] = df['time'].dt.year  # Trích xuất năm
    df['month'] = df['time'].dt.month  # Trích xuất tháng
    df['day'] = df['time'].dt.day  # Trích xuất ngày
    df = df.set_index('time')  # Đặt cột 'time' làm chỉ mục
    return df

def predict_next_day_price(df, symbol):
    df = prepare_data(df)
    features = ['year', 'month', 'day', 'dayofyear', 'openPrice', 'highPrice', 'lowPrice', 'volume', 'quoteVolume']
    target = 'lastPrice'

    X = df[features]
    y = df[target]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Dự đoán trên tập kiểm tra
    y_pred = model.predict(X_test)
    print(f'Mean Squared Error: {mean_squared_error(y_test, y_pred):.2f}')

    # Dự đoán cho ngày tiếp theo (ngày tiếp theo dựa trên ngày cuối cùng của dữ liệu)
    last_day = df.index[-1]
    next_day = last_day + pd.Timedelta(days=1)
    next_day_features = pd.DataFrame([[next_day.year, next_day.month, next_day.day, next_day.dayofyear,
                                       df.iloc[-1]['openPrice'], df.iloc[-1]['highPrice'], df.iloc[-1]['lowPrice'],
                                       df.iloc[-1]['volume'], df.iloc[-1]['quoteVolume']]], 
                                     columns=features)

    next_day_prediction = model.predict(next_day_features)[0]
    print(f'Dự đoán giá trị {symbol} cho ngày {next_day.strftime("%Y-%m-%d")}: {next_day_prediction:.2f}')
    return next_day_prediction

@app.route('/predict_next_day_price/<symbol>', methods=['GET'])
def get_next_day_prediction(symbol):
    """Trả về dự đoán giá trị ngày tiếp theo cho đồng coin."""
    raw_data = fetch_raw_data()
    df_symbol = raw_data[raw_data['symbol'] == symbol]

    if df_symbol.empty:
        return jsonify({"error": f"No data found for symbol: {symbol}"}), 404

    predicted_price = predict_next_day_price(df_symbol, symbol)
    return jsonify({"symbol": symbol, "predicted_price": predicted_price})

def analyze_volatility(df, symbol, year=2024):
    # Chuyển cột 'time' thành datetime
    df['time'] = pd.to_datetime(df['time'], errors='coerce')

    # Lọc dữ liệu chỉ lấy năm chỉ định
    df_filtered = df[df['time'].dt.year == year]

    # Chuyển đổi giá trị cột priceChangePercent thành float và bỏ giá trị NaN
    df_filtered['priceChangePercent'] = pd.to_numeric(df_filtered['priceChangePercent'], errors='coerce')
    df_filtered = df_filtered.dropna(subset=['priceChangePercent'])

    # Lọc dữ liệu theo đồng coin
    df_symbol = df_filtered[df_filtered['symbol'] == symbol]

    # Loại bỏ các cột không cần thiết
    df_symbol = df_symbol.drop(columns=['symbol', 'buyVolume', 'sellVolume', 'id'], errors='ignore')

    # Kiểm tra nếu dữ liệu đủ để thực hiện clustering
    if df_symbol.shape[0] < 4:
        return {"error": f"Not enough data for {symbol} to perform clustering."}

    # Thêm cột 'time_period' để nhóm theo ngày
    df_symbol['time_period'] = df_symbol['time'].dt.to_period('D')

    # Lấy các cột cần thiết cho K-Means clustering
    X = df_symbol[['priceChange', 'priceChangePercent', 'volume']].values

    # Áp dụng thuật toán K-Means clustering
    kmeans = KMeans(n_clusters=4, random_state=42)
    df_symbol['cluster'] = kmeans.fit_predict(X)

    # Gắn nhãn độ biến động dựa trên giá trị trung bình của priceChangePercent
    cluster_means = df_symbol.groupby(['cluster', 'time_period'])['priceChangePercent'].mean(numeric_only=True)
    volatility_labels = {i: 'High Volatility' if mean > 0 else 'Low Volatility' for i, mean in cluster_means.items()}
    df_symbol['volatility_label'] = df_symbol.apply(
        lambda row: volatility_labels.get((row['cluster'], row['time_period']), 'Unknown'),
        axis=1
    )

    # Chuyển đổi 'time_period' thành chuỗi
    df_symbol['time_period'] = df_symbol['time_period'].astype(str)

    # Tóm tắt dữ liệu các cụm theo khoảng thời gian
    cluster_summary = (
        df_symbol.groupby(['cluster', 'time_period'])
        .mean(numeric_only=True)
        .reset_index()
    )
    cluster_summary['time_period'] = cluster_summary['time_period'].astype(str)
    cluster_summary = cluster_summary.to_dict(orient='records')

    return {"symbol": symbol, "cluster_summary": cluster_summary}

@app.route('/analyze_volatility/<symbol>/<int:year>', methods=['GET'])
def get_analyze_volatility(symbol, year):
    # Fetch raw data (giả định fetch_raw_data() đã được định nghĩa)
    df = fetch_raw_data()

    # Gọi hàm phân tích
    result = analyze_volatility(df, symbol, year)

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
