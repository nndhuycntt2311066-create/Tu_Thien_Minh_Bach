import React from 'react';

export default function Countdown({ deadlineMs }) {
  const now = Date.now();
  const diff = Number(deadlineMs) - now;

  if (diff <= 0) {
    return <span style={{ color: '#d32f2f', fontSize: '12px', fontWeight: 'bold' }}>Đã kết thúc</span>;
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return <span style={{ color: '#666', fontSize: '12px' }}>⏳ Còn {days} ngày</span>;
}