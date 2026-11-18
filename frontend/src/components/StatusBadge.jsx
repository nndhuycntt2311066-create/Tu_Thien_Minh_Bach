import React from 'react';
import { getCampaignStatus } from '../utils/campaignStatus';

export default function StatusBadge({ campaign }) {
  const status = getCampaignStatus(campaign);
  
  // Phối màu theo trạng thái
  const colors = {
    'Đang chạy': { bg: '#e3f2fd', text: '#1976d2' },
    'Đạt mục tiêu': { bg: '#e8f5e9', text: '#388e3c' },
    'Hết hạn': { bg: '#ffebee', text: '#d32f2f' },
    'Đã rút': { bg: '#f5f5f5', text: '#616161' }
  };
  const { bg, text } = colors[status] || colors['Đang chạy'];

  return (
    <span style={{ 
      backgroundColor: bg, color: text, padding: '4px 8px', 
      borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' 
    }}>
      {status}
    </span>
  );
}