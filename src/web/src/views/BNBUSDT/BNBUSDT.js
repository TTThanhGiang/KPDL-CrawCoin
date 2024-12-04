import React, { useEffect, useState } from "react";
import { CRow, CCol, CCard, CCardBody } from "@coreui/react";
import PriceChart from "../../components/PriceChart";
import CoinInfo from "../../components/CoinInfo";
import CorrelationMatrix from "../../components/CorrelationMatrix";
import PriceComparisonChart from "../../components/PriceComparisonChart";
import PriceTrendChart from "../../components/PriceTrendChart";
import SeasonalChart from "../../components/SeasonalChart";
import SpiderChart from "../../components/SpiderChart";
import ClusterChart from "../../components/ClusterChart";

const Dashboard = () => {
  const [coinData, setCoinData] = useState([]);
  const [allCoinData, setAllCoinData] = useState([]);
  const [lastedCoin, setLastedCoin] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [correlationData, setCorrelationData] = useState(null);
  const [coinSymbol, setCoinSymbol] = useState("BNBUSDT");
  const [comparisonSymbol, setComparisonSymbol] = useState("ETHUSDT");

  const fetchAllData = async () => {
    try {
      const response = await fetch("http://localhost:5000/data");
      const data = await response.json();
      setAllCoinData(data);

      // Get latest data for BNBUSDT
      const btcData = data.filter((coin) => coin.symbol === "BNBUSDT");
      setCoinData(btcData);
      if (btcData.length) {
        const latestData = btcData[btcData.length - 1];
        setLastedCoin(latestData);
      }
    } catch (error) {
      console.error("Error fetching all coin data:", error);
    }
  };

  const fetchCorrelationData = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/correlation_matrix/BNBUSDT"
      );
      const data = await response.json();
      setCorrelationData(data);
    } catch (error) {
      console.error("Error fetching correlation data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchCorrelationData();

    const interval = setInterval(() => {
      fetchAllData();
      fetchCorrelationData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const logo = "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png";

  return (
    <CRow>
      <CRow>
        {lastedCoin && (
          <CCol sm={4}>
            <CoinInfo data={lastedCoin} logo={logo} />
          </CCol>
        )}
        <CCol sm={8}>
          <PriceChart coinSymbol="BNBUSDT" coinData={coinData} />
        </CCol>
      </CRow>

      {/* Row for PriceTrendChart and PriceComparisonChart */}
      <CRow className="mb-4">
        <CCol sm={6}>
          <CCard style={{ height: "100%" }}>
            <CCardBody>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <h5>Trend</h5>
              </div>
              <PriceTrendChart coinSymbol={coinSymbol} coinData={coinData} />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6}>
          <CCard style={{ height: "100%" }}>
            <CCardBody>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <h5>Price Change Percent</h5>
              </div>
              <div>
                <label style={{ marginRight: "10px" }}>
                  Select Coin:
                  <select
                    value={coinSymbol}
                    onChange={(e) => setCoinSymbol(e.target.value)}
                  >
                    <option value="BTCUSDT">BTC</option>
                    <option value="ETHUSDT">ETH</option>
                    <option value="BNBUSDT">BNB</option>
                  </select>
                </label>
                <label>
                  Compare with:
                  <select
                    value={comparisonSymbol}
                    onChange={(e) => setComparisonSymbol(e.target.value)}
                  >
                    <option value="BTCUSDT">BTC</option>
                    <option value="ETHUSDT">ETH</option>
                    <option value="BNBUSDT">BNB</option>
                  </select>
                </label>
              </div>
              <PriceComparisonChart
                coinSymbol={coinSymbol}
                comparisonSymbol={comparisonSymbol}
                allCoinData={allCoinData}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {/* Other components */}
      <CRow className="mb-4">
        <CCol sm={12}>
          <CCard>
            <CCardBody>
              <SeasonalChart coinSymbol={coinSymbol} />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol sm={6}>
          <CCard style={{ height: "100%" }}>
            <CCardBody>
              {correlationData && (
                <CorrelationMatrix
                  data={correlationData}
                  coinSymbol="BNBUSDT"
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6}>
          <CCard>
            <CCardBody>
              {lastedCoin && <SpiderChart coinData={lastedCoin} />}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CRow className="mb-4">
        <CCol sm={12}>
          <CCard>
            <CCardBody>
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ marginLeft: "20px" }}>
                    Select Year:
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value={2019}>2019</option>
                      <option value={2020}>2020</option>
                      <option value={2021}>2021</option>
                      <option value={2022}>2022</option>
                      <option value={2023}>2023</option>
                      <option value={2024}>2024</option>
                    </select>
                  </label>
                </div>

                <ClusterChart symbol="BNBUSDT" year={selectedYear} />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CRow>
  );
};

export default Dashboard;
