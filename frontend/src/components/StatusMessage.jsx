import React from 'react';

const StatusMessage = ({ state, message, explorerUrl }) => {
  if (!state || state === 'idle') return null;

  // Chọn màu theo trạng thái (success = xanh, error = đỏ, rejected = cam)
  const getBackgroundColor = () => {
    switch (state) {
      case 'success': return '#d4edda'; // Xanh lá
      case 'error': return '#f8d7da'; // Đỏ
      case 'rejected': return '#fff3cd'; // Cam/Vàng
      case 'pending': 
      case 'confirming': return '#cce5ff'; // Xanh dương
      default: return '#f8f9fa'; // Xám nhạt
    }
  };

  const getTextColor = () => {
    switch (state) {
      case 'success': return '#155724';
      case 'error': return '#721c24';
      case 'rejected': return '#856404';
      case 'pending':
      case 'confirming': return '#004085';
      default: return '#333';
    }
  };

  return (
    <div style={{
      padding: '10px',
      marginTop: '10px',
      borderRadius: '4px',
      backgroundColor: getBackgroundColor(),
      color: getTextColor(),
      border: `1px solid ${getTextColor()}`
    }}>
      <p style={{ margin: 0, fontSize: '14px' }}>{message}</p>
      {explorerUrl && (
        <a 
          href={explorerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '12px', color: getTextColor(), textDecoration: 'underline' }}
        >
          Xem trên Etherscan
        </a>
      )}
    </div>
  );
};

export default StatusMessage;