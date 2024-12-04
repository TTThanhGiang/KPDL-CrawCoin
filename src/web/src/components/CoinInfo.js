import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CProgress,
  CProgressBar,
} from "@coreui/react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const CoinInfo = ({ data, logo }) => {
  const [predictedPrice, setPredictedPrice] = useState(null);

  const {
    symbol,
    lastPrice,
    priceChange,
    priceChangePercent,
    lowPrice,
    highPrice,
    volume,
  } = data;

  // Gọi API để lấy giá dự đoán cho ngày mai
  useEffect(() => {
    const fetchPredictedPrice = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/predict_next_day_price/${symbol}`
        );
        const data = await response.json();
        setPredictedPrice(data.predicted_price);
      } catch (error) {
        console.error("Error fetching predicted price:", error);
      }
    };

    fetchPredictedPrice();
  }, [symbol]); // Chỉ gọi lại khi `symbol` thay đổi

  const priceChangeStyle = priceChange.startsWith("-")
    ? "text-danger"
    : "text-success";
  const PriceChangeIcon = priceChange.startsWith("-") ? FaArrowDown : FaArrowUp;

  // Tính phần trăm vị trí giá hiện tại
  const low = parseFloat(lowPrice);
  const high = parseFloat(highPrice);
  const last = parseFloat(lastPrice);
  const progress = ((last - low) / (high - low)) * 100;

  return (
    <CCard
      className="mb-4"
      style={{
        height: "calc(100% - 1.5rem)",
        boxSizing: "border-box",
      }}
    >
      <CCardBody>
        <h4 className="mt-2">
          {/* Hiển thị logo trước symbol */}
          <img
            src={logo}
            alt="Coin logo"
            style={{
              width: "24px",
              height: "24px",
              marginRight: "8px",
              marginBottom: "8px",
            }}
          />
          {symbol}
        </h4>
        <CRow className="mt-4 align-items-center">
          <CCol sm={6}>
            <h3>
              $
              {last.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </CCol>
          <CCol
            sm={6}
            className={`d-flex align-items-center ${priceChangeStyle}`}
          >
            <PriceChangeIcon className="me-1" />
            <span>{`${parseFloat(priceChange).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}$ (${parseFloat(priceChangePercent).toFixed(2)}%)`}</span>
          </CCol>
        </CRow>

        <div className="mt-4">
          <h5 className="text-muted">Price performance</h5>
          <CRow className="justify-content-between">
            <CCol xs="auto">
              <span>
                Low:{" "}
                <strong>
                  $
                  {low.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </span>
            </CCol>
            <CCol xs="auto">
              <span>
                High:{" "}
                <strong>
                  $
                  {high.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </span>
            </CCol>
          </CRow>
          <CProgress className="mt-2" style={{ height: "8px" }}>
            <CProgressBar value={progress} className="bg-primary" />
          </CProgress>
        </div>

        <p className="mt-4">
          Volume:{" "}
          <strong>
            {parseFloat(volume).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {symbol}
          </strong>
        </p>

        {/* Hiển thị giá dự đoán */}
        {predictedPrice && (
          <div className="mt-4 d-flex align-items-center">
            <p className="text-muted mb-0" style={{ marginRight: "8px" }}>
              Predicted Price for Tomorrow:
            </p>
            <h6 className="mb-0">
              $
              {predictedPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h6>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default CoinInfo;
