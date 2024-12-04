import React from 'react';
import Plot from 'react-plotly.js';

const CorrelationMatrix = ({ data, coinSymbol }) => {
  // Chọn 5 thông số hợp lý để hiển thị
  const parameters = ['buyVolume', 'sellVolume', 'priceChange', 'volume', 'weightedAvgPrice'];

  // Lấy giá trị correlation matrix từ dữ liệu
  const correlationMatrix = parameters.map((rowParam) =>
    parameters.map((colParam) => data[rowParam][colParam])
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Plot
        data={[
          {
            z: correlationMatrix,
            x: parameters,
            y: parameters,
            type: 'heatmap',
            colorscale: 'Viridis',
          },
        ]}
        layout={{
          title: {
            text: `Correlation Matrix for ${coinSymbol}`,
            font: { size: 16 },
            x: 0.5,
          },
          autosize: true,
          margin: { l: 50, r: 50, t: 50, b: 50 },
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default CorrelationMatrix;
