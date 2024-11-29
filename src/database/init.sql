CREATE DATABASE IF NOT EXISTS crypto_db;

USE crypto_db;

CREATE TABLE IF NOT EXISTS coin_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    priceChange DECIMAL(18, 8),
    priceChangePercent DECIMAL(18, 8),
    weightedAvgPrice DECIMAL(18, 8),
    lastPrice DECIMAL(18, 8),
    openPrice DECIMAL(18, 8),
    highPrice DECIMAL(18, 8),
    lowPrice DECIMAL(18, 8),
    volume DECIMAL(18, 8),
    quoteVolume DECIMAL(18, 8),
    buyVolume DECIMAL(18, 8),
    sellVolume DECIMAL(18, 8),
    time DATETIME DEFAULT CURRENT_TIMESTAMP
);