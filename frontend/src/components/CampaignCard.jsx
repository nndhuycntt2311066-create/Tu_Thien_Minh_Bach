import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import Countdown from './Countdown';
import { useWallet } from '../web3/hooks/useWallet';
import { useDonate } from '../web3/hooks/useDonate';
import StatusMessage from './StatusMessage';
import WithdrawRefundButtons from './WithdrawRefundButtons'; // Thêm import nút Rút/Hoàn tiền


export default function CampaignCard({ campaign }) {
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const { signer } = useWallet();
  const {
    donate,
    state: txState,
    message: txMessage,
    isBusy,
    explorerUrl,
    reset,
  } = useDonate(signer);
  
  const statusMessage = formError || txMessage || {
    confirming: 'Vui lòng mở MetaMask và xác nhận giao dịch...',
    pending: 'Giao dịch đã gửi, đang chờ xác nhận...',
    success: 'Quyên góp thành công! Cảm ơn tấm lòng của bạn.',
  }[txState] || '';

  useEffect(() => {
    if (txState === 'success') setAmount('');
  }, [txState]);

  const handleDonate = async () => {
    setFormError('');

    if (campaign?.id === undefined || campaign?.id === null) {
      setFormError('Chiến dịch không hợp lệ, vui lòng thử lại sau!');
      return;
    }

    if (!signer) {
      setFormError('Vui lòng bấm Kết nối ví MetaMask trên thanh điều hướng trước!');
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
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '16px', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hình ảnh */}
      {campaign.imageURI ? (
        <img src={campaign.imageURI} alt={campaign.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }} />
      ) : (
        <div style={{ width: '100%', height: '200px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }} />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <Link to={`/campaigns/${campaign.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ margin: '0 0 8px 0', cursor: 'pointer' }}>{campaign.title}</h3>
        </Link>
        <StatusBadge campaign={campaign} />
      </div>
      <p style={{ color: '#666', fontSize: '14px', flexGrow: 1 }}>{campaign.description}</p>
      
      <div style={{ margin: '16px 0', fontSize: '14px' }}>
        <p style={{ margin: '4px 0' }}><strong>Mục tiêu:</strong> {campaign.target} ETH</p>
<<<<<<< Updated upstream
        <p style={{ margin: '4px 0' }}><strong>Đã gom:</strong> {campaign.raised || 0} ETH</p>
=======
        <p style={{ margin: '4px 0' }}><strong>Đã gom:</strong> {campaign.raised ?? campaign.amountCollected ?? 0} ETH</p>
        <ProgressBar raised={campaign.raised ?? campaign.amountCollected} target={campaign.target} />
        {campaign.deadlineMs != null && <Countdown deadlineMs={campaign.deadlineMs} />}
>>>>>>> Stashed changes
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
          disabled={isBusy || txState === 'confirming'}
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button 
          onClick={handleDonate} 
          disabled={isBusy || txState === 'confirming'}
          style={{ 
            padding: '10px', borderRadius: '6px', border: 'none', fontWeight: 'bold',
            background: (isBusy || txState === 'confirming') ? '#cccccc' : '#ff9800', 
            color: 'white', 
            cursor: (isBusy || txState === 'confirming') ? 'not-allowed' : 'pointer' 
          }}
        >
          {txState === 'pending' ? 'Đang xử lý...' : isBusy ? 'Đang xác nhận...' : 'Quyên góp ngay'}
        </button>

        <StatusMessage 
          state={formError ? 'error' : txState}
          message={statusMessage}
          explorerUrl={explorerUrl} 
        />
      </div>

      {/* Đã nhúng cụm nút Rút / Hoàn tiền vào cuối thẻ */}
      <WithdrawRefundButtons campaign={campaign} />
      
    </div>
  );
}