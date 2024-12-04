import React, { useEffect, useState } from "react";
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CRow,
  CCol,
} from "@coreui/react";
import { CChartLine } from "@coreui/react-chartjs";
import axios from "axios";

const PriceChart = ({ coinSymbol = "BTCUSDT", coinData = [] }) => {
  const [viewMode, setViewMode] = useState("Day");
  const [chartData, setChartData] = useState([]);
  const [chartLabels, setChartLabels] = useState([]);

  useEffect(() => {
    if (viewMode === "Day") {
      const filteredData = coinData.slice(-24);
      setChartData(filteredData.map((item) => item.lastPrice));
      setChartLabels(
        filteredData.map((item) => new Date(item.time).toLocaleTimeString())
      );
    }
  }, [viewMode, coinSymbol, coinData]);

  const sanitizeJSON = (data) => {
    try {
      const sanitizedData = data.replace(/NaN/g, "null");
      return JSON.parse(sanitizedData);
    } catch (error) {
      console.error("Error sanitizing JSON:", error);
      return [];
    }
  };

  // Fetch data for daily, weekly, and monthly views
  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = "";
        if (viewMode === "Week") {
          endpoint = `http://localhost:5001/daily_data/${coinSymbol}`;
        } else if (viewMode === "Month") {
          endpoint = `http://localhost:5001/weekly_data/${coinSymbol}`;
        } else if (viewMode === "Year") {
          endpoint = `http://localhost:5001/monthly_data/${coinSymbol}`;
        }

        if (endpoint) {
          const response = await axios.get(endpoint);

          // If response is not in JSON format, sanitize the JSON
          let parsedData = [];
          if (typeof response.data === "string") {
            parsedData = sanitizeJSON(response.data);
          } else {
            parsedData = response.data;
          }

          // Remove invalid data points
          const validData = parsedData.filter(
            (item) => !isNaN(item.lastPrice) && item.lastPrice !== null
          );
          const limit = viewMode === "Week" ? 8 : viewMode === "Month" ? 5 : 13;
          const limitedData = validData.slice(-limit);

          // Update chart data
          setChartData(limitedData.map((item) => item.lastPrice));
          setChartLabels(
            limitedData.map((item) => new Date(item.time).toLocaleDateString())
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (viewMode !== "Day") fetchData();
  }, [viewMode, coinSymbol]);

  return (
    <CCard className="mb-4">
      <CCardBody>
        <CRow>
          <CCol sm={5}>
            <h4 className="card-title mb-0">Price</h4>
            <div className="small text-body-secondary">
              {viewMode === "Day" && "Last 24 Data Points"}
              {viewMode === "Week" && "Last 7 Days"}
              {viewMode === "Month" && "Last 4 Weeks"}
              {viewMode === "Year" && "Last 12 Months"}
            </div>
          </CCol>
          <CCol sm={7} className="d-none d-md-block">
            <CButtonGroup className="float-end">
              {["Day", "Week", "Month", "Year"].map((mode) => (
                <CButton
                  key={mode}
                  color="outline-secondary"
                  className="mx-0"
                  active={viewMode === mode}
                  onClick={() => setViewMode(mode)}
                >
                  {mode}
                </CButton>
              ))}
            </CButtonGroup>
          </CCol>
        </CRow>
        <CChartLine
          style={{ height: "300px", marginTop: "40px" }}
          data={{
            labels: chartLabels,
            datasets: [
              {
                label: `${coinSymbol} Price`,
                backgroundColor: "rgba(75,192,192,0.2)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 2,
                pointBackgroundColor: "rgba(75,192,192,1)",
                data: chartData,
                fill: true,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
            },
            scales: {
              x: {
                grid: {
                  color: "#f3f3f3",
                },
                ticks: {
                  color: "#333",
                },
              },
              y: {
                beginAtZero: false,
                ticks: {
                  color: "#333",
                },
                grid: {
                  color: "#f3f3f3",
                },
              },
            },
          }}
        />
      </CCardBody>
    </CCard>
  );
};

export default PriceChart;
