# src/database_api/Dockerfile
FROM python:3.9

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép requirements.txt vào container
# COPY ../../requirements.txt .

RUN pip install Flask mysql-connector-python requests pandas python-binance schedule gunicorn flask-cors pytz
# Cài đặt các thư viện từ requirements.txt
# RUN pip install --no-cache-dir -r requirements.txt

# Sao chép mã nguồn vào container
COPY . .

# Chạy ứng dụng bằng Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
