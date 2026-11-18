import React from 'react';
import { useDonations } from '../web3/hooks/useDonations';
import ShortAddress from './ShortAddress';
import { etherscanTxUrl } from '../contracts/config';

export default function DonationHistory({ campaignId }) {
  const { donations, isLoading, error } = useDonations(campaignId);

  if (isLoading && donations.length === 0) {
    return <p style={{ color: '#888' }}>Đang tải lịch sử quyên góp...</p>;
  }
  if (error) return <p style={{ color: 'red' }}>Lỗi: {error}</p>;
  if (donations.length === 0) {
    return <p style={{ color: '#888' }}>Chưa có lượt quyên góp nào.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '8px' }}>Người quyên góp</th>
            <th style={{ padding: '8px' }}>Số tiền</th>
            <th style={{ padding: '8px' }}>Giao dịch</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d, i) => (
            <tr key={`${d.txHash}-${i}`} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}><ShortAddress address={d.donor} /></td>
              <td style={{ padding: '8px' }}>{d.amount} ETH</td>
              <td style={{ padding: '8px' }}>
                <a href={etherscanTxUrl(d.txHash)} target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3' }}>
                  Xem trên Etherscan
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}