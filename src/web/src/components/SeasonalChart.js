import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

const SeasonalChart = ({ coinSymbol }) => {
  const [seasonalData, setSeasonalData] = useState([]);
  const [labels, setLabels] = useState([]);
  const [lastPrices, setLastPrices] = useState([]);

  const fetchSeasonalData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/seasonal_analysis/${coinSymbol}`
      );
      const data = await response.json();

      // Extract years and last prices for the chart
      const years = data.map((item) => new Date(item.time).getFullYear());
      const prices = data.map((item) => item.lastPrice);

      setLabels(years);
      setLastPrices(prices);
      setSeasonalData(data);
    } catch (error) {
      console.error("Error fetching seasonal data:", error);
    }
  };

  useEffect(() => {
    fetchSeasonalData();
  }, [coinSymbol]);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${coinSymbol} Last Price Over Years`,
        data: lastPrices,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        pointBorderColor: "rgba(75, 192, 192, 1)",
        pointBackgroundColor: "#fff",
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
        pointHoverBorderColor: "rgba(220, 220, 220, 1)",
        pointHoverBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Price: $${tooltipItem.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: false,
          text: "Year",
          color: "#333",
        },
      },
      y: {
        title: {
          display: false,
          text: "Last Price ($)",
          color: "#333",
        },
        beginAtZero: false,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default SeasonalChart;
