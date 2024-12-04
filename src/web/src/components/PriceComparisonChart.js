import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

const PriceComparisonChart = ({ coinSymbol, comparisonSymbol, allCoinData = [] }) => {
  const [coinDataFiltered, setCoinDataFiltered] = useState([]);
  const [comparisonDataFiltered, setComparisonDataFiltered] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    // Filter and process coinData based on selected symbols
    const filterData = (symbol) =>
      allCoinData
        .filter((item) => item.symbol === symbol)
        .slice(-30)
        .map((item) => ({
          time: new Date(item.time).toLocaleTimeString(),
          priceChangePercent: parseFloat(item.priceChangePercent),
        }));

    const coinDataFiltered = filterData(coinSymbol);
    const comparisonDataFiltered = filterData(comparisonSymbol);

    setLabels(coinDataFiltered.map((item) => item.time));
    setCoinDataFiltered(coinDataFiltered.map((item) => item.priceChangePercent));
    setComparisonDataFiltered(comparisonDataFiltered.map((item) => item.priceChangePercent));
  }, [coinSymbol, comparisonSymbol, allCoinData]);

  const data = {
    labels,
    datasets: [
      {
        label: `${coinSymbol} % Change`,
        data: coinDataFiltered,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        tension: 0.4,
      },
      {
        label: `${comparisonSymbol} % Change`,
        data: comparisonDataFiltered,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
    },
    scales: {
      x: { display: true, title: { display: false, text: 'Time' } },
      y: { display: true, title: { display: true, text: 'Price Change %' } },
    },
  };

  return <Line data={data} options={options} />;
};

export default PriceComparisonChart;
