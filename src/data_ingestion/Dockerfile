# src/data_ingestion/Dockerfile
FROM python:3.9

# Đặt thư mục làm việc
WORKDIR /app

# Sao chép requirements.txt vào container
#COPY ../../requirements.txt .
RUN pip install mysql-connector-python requests pandas python-binance pytz

# Cài đặt các thư viện từ requirements.txt
#RUN pip install --no-cache-dir -r requirements.txt

# Sao chép mã nguồn vào container
COPY . .

# Chạy ứng dụng
CMD ["python", "app.py"]
