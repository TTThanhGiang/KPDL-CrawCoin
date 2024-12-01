# Chọn base image Python
FROM python:3.9

# Set working directory
WORKDIR /app

# Copy requirements file và cài đặt các phụ thuộc
RUN pip install pandas numpy scikit-learn requests flask flask-cors mysql-connector-python gunicorn

# Copy toàn bộ mã nguồn vào container
COPY . .


CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]

