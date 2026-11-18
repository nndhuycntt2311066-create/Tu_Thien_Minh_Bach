import React, { useState } from 'react';
import { useWallet } from '../web3/hooks/useWallet';
import { useDonate } from '../web3/hooks/useDonate';

export default function CampaignCard({ campaign }) {
  const [amount, setAmount] = useState('');

  // Lấy tài khoản đang kết nối truyền cho hàm Quyên góp
  const { signer } = useWallet();
  const { donate, isBusy, message, explorerUrl } = useDonate(signer);

  const handleDonate = async () => {
    if (!campaign?.id) {
      return alert('Chiến dịch không hợp lệ, vui lòng thử lại sau!');
    }

    if (!signer) {
      return alert('Vui lòng bấm Kết nối ví MetaMask trên thanh điều hướng trước!');
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return alert('Vui lòng nhập số ETH hợp lệ!');
    }

    // Gọi hàm quyên góp của B
    await donate(campaign.id, numericAmount.toString());
    setAmount('');
  };

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hình ảnh */}
      {campaign.imageURI ? (
        <img src={campaign.imageURI} alt={campaign.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
      ) : (
        <div style={{ width: '100%', height: '200px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }} />
      )}
      
      <h3 style={{ margin: '0 0 8px 0' }}>{campaign.title}</h3>
      <p style={{ color: '#666', fontSize: '14px', flexGrow: 1 }}>{campaign.description}</p>
      
      <div style={{ margin: '16px 0', fontSize: '14px' }}>
        <p style={{ margin: '4px 0' }}><strong>Mục tiêu:</strong> {campaign.target} ETH</p>
        <p style={{ margin: '4px 0' }}><strong>Đã gom:</strong> {campaign.raised || 0} ETH</p>
      </div>

      {/* Form Quyên góp */}
      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <input 
          type="number"
          min="0"
          step="any"
          placeholder="Nhập số ETH (VD: 0.1)" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={handleDonate} 
          disabled={isBusy}
          style={{ 
            padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold',
            background: isBusy ? '#cccccc' : '#ff9800', 
            color: 'white', 
            cursor: isBusy ? 'not-allowed' : 'pointer' 
          }}
        >
          {isBusy ? 'Đang xác nhận...' : 'Quyên góp ngay'}
        </button>

        {/* Thông báo trạng thái và Link */}
        {message && (
          <small style={{ color: message.toLowerCase().includes('lỗi') ? 'red' : 'green', marginTop: '4px' }}>
            {message}
          </small>
        )}
        {explorerUrl && (
          <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#2196F3', marginTop: '4px' }}>
            Xem giao dịch trên Etherscan
          </a>
        )}
      </div>
    </div>
  );
}