import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';

const PriceTrendChart = ({ coinSymbol, coinData = [] }) => {
  const [chartData, setChartData] = useState(null);
  const [timeFrame, setTimeFrame] = useState('day'); // Options: 'day', 'week', 'month'

  const resampleData = (data, timeFrame) => {
    const groupedData = {};
    data.forEach((item) => {
      const date = new Date(item.time);
      let groupKey;
      if (timeFrame === 'day') groupKey = format(startOfDay(date), 'yyyy-MM-dd');
      else if (timeFrame === 'week') groupKey = format(startOfWeek(date), 'yyyy-MM-dd');
      else if (timeFrame === 'month') groupKey = format(startOfMonth(date), 'yyyy-MM');

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }
      groupedData[groupKey].push(Number(item.lastPrice));
    });

    const labels = Object.keys(groupedData);
    const prices = labels.map((label) =>
      groupedData[label].reduce((sum, price) => sum + price, 0) / groupedData[label].length
    );

    return {
      labels,
      datasets: [
        {
          label: `${coinSymbol} Last Price (${timeFrame})`,
          data: prices,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
        },
      ],
    };
  };

  useEffect(() => {
    if (coinData.length > 0) {
        const resampledData = resampleData(coinData, timeFrame);
        setChartData(resampledData);
      }
  }, [coinData, timeFrame]);

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <label>Select Timeframe: </label>
        <select value={timeFrame} onChange={(e) => setTimeFrame(e.target.value)}>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
      </div>
      {chartData ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true },
            },
            scales: {
              x: { title: { display: false, text: 'Time' } },
              y: { title: { display: true, text: 'Last Price (USDT)' } },
            },
          }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default PriceTrendChart;
