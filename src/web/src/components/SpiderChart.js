import React from 'react';
import { Radar } from 'react-chartjs-2';

const SpiderChart = ({ coinData }) => {
  const labels = ['High Price', 'Last Price', 'Low Price', 'Open Price'];
  const values = coinData
    ? [coinData.highPrice, coinData.lastPrice, coinData.lowPrice, coinData.openPrice].map(parseFloat)
    : [0, 0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        label: `${coinData?.symbol || 'Coin'} Prices`,
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        min: Math.max(0, Math.min(...values) * 0.97), // Giá trị nhỏ nhất
        max: Math.max(...values) * 1.03,             // Giá trị lớn nhất
        angleLines: { color: 'rgba(128, 128, 128, 0.3)' },
        grid: { color: 'rgba(128, 128, 128, 0.3)' },
        ticks: {
          count: 10,              // Số mức dữ liệu
          backdropColor: '#fff',  // Màu nền
          color: '#000',          // Màu nhãn
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ width: '100%', height: '600px' }}> {/* Chiều cao lớn hơn */}
      <Radar data={data} options={options} />
    </div>
  );
};

export default SpiderChart;
