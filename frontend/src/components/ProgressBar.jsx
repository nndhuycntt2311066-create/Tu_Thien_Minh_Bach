import React from 'react';

export default function ProgressBar({ raised, target }) {
  const raisedNum = Number(raised) || 0;
  const targetNum = Number(target) || 1; // Tránh chia cho 0
  
  // Tính % và chốt tối đa 100%
  const percent = Math.min((raisedNum / targetNum) * 100, 100);

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
        <span>Tiến độ</span>
        <strong>{percent.toFixed(1)}%</strong>
      </div>
      <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${percent}%`, 
          backgroundColor: percent >= 100 ? '#4caf50' : '#ff9800', 
          height: '100%',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}