import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "chartjs-adapter-date-fns"; // Import adapter ngày

const ClusterChart = ({ symbol, year }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClusterData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5001/analyze_volatility/${symbol}/${year}`
        );
        const data = await response.json();

        // Process data for Chart.js
        const clusters = [
          ...new Set(data.cluster_summary.map((item) => item.cluster)),
        ]; // Unique clusters
        const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"]; // Colors for clusters

        // Define cluster names
        const clusterNames = [
          "Low Volatility & Volume",
          "Moderate Volatility & Volume",
          "High Volatility & Volume",
          "Extreme Volatility/Outliers",
        ];

        const datasets = clusters.map((cluster, index) => ({
          label: clusterNames[cluster], // Use the new names
          data: data.cluster_summary
            .filter((item) => item.cluster === cluster)
            .map((item) => ({
              x: item.time_period,
              y: item.priceChangePercent,
            })),
          borderColor: colors[index % colors.length],
          backgroundColor: colors[index % colors.length],
          showLine: false,
          pointRadius: 4,
          pointStyle: "circle",
        }));

        setChartData({
          datasets,
        });
      } catch (error) {
        console.error("Error fetching cluster data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClusterData();
  }, [symbol, year]);

  if (loading) return <div>Loading...</div>;
  if (!chartData) return <div>No data available</div>;

  return (
    <div style={{ width: "100%", height: "400px", maxWidth: "100%" }}>
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
          },
          scales: {
            x: {
              type: "time",
              time: {
                unit: "day",
              },
              title: {
                display: false,
                text: "Time Period",
              },
            },
            y: {
              title: {
                display: true,
                text: "Price Change Percent (%)",
              },
            },
          },
        }}
      />
    </div>
  );
};

export default ClusterChart;
