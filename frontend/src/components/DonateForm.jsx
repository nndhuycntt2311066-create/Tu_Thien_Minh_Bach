import React, { useState, useEffect } from 'react';
import { useWallet } from '../web3/hooks/useWallet';
import { useDonate } from '../web3/hooks/useDonate';
import StatusMessage from './StatusMessage';

export default function DonateForm({ campaign }) {
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const { signer } = useWallet();
  const { donate, state: txState, message: txMessage, isBusy, explorerUrl, reset } = useDonate(signer);
  
  const statusMessage = formError || txMessage || {
    confirming: 'Vui lòng mở MetaMask và xác nhận giao dịch...',
    pending: 'Giao dịch đã gửi, đang chờ xác nhận...',
    success: 'Quyên góp thành công! Cảm ơn tấm lòng của bạn.',
  }[txState] || '';

  useEffect(() => {
    if (txState === 'success') setAmount('');
  }, [txState]);

  // Nếu chiến dịch đã hết hạn hoặc đã đạt mục tiêu/rút tiền, ẩn form quyên góp
  if (!campaign || campaign.withdrawn || Date.now() >= Number(campaign.deadlineMs)) {
    return null; 
  }

  const handleDonate = async () => {
    setFormError('');
    if (campaign.id === undefined || campaign.id === null) {
      setFormError('Chiến dịch không hợp lệ!');
      return;
    }
    if (!signer) {
      setFormError('Vui lòng Kết nối ví MetaMask!');
      return;
    }
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Vui lòng nhập số ETH hợp lệ!');
      return;
    }
    reset();
    await donate(campaign.id, numericAmount.toString());
  };

  return (
    <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', marginTop: '16px' }}>
      <input 
        type="number" min="0" step="any" placeholder="Nhập số ETH (VD: 0.1)" 
        value={amount} onChange={(e) => setAmount(e.target.value)}
        disabled={isBusy}
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
      />
      <button 
        onClick={handleDonate} disabled={isBusy}
        style={{ 
          padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold',
          background: isBusy ? '#cccccc' : '#ff9800', color: 'white', cursor: isBusy ? 'not-allowed' : 'pointer' 
        }}
      >
        {txState === 'pending' ? 'Đang xử lý...' : isBusy ? 'Đang xác nhận...' : 'Quyên góp ngay'}
      </button>
      <StatusMessage state={formError ? 'error' : txState} message={statusMessage} explorerUrl={explorerUrl} />
    </div>
  );
}