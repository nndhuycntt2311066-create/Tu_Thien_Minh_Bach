import React, { useState } from 'react';
import { useWallet } from '../web3/hooks/useWallet';
// Giả định bạn có 2 hook này từ thư mục web3/hooks/
import { useWithdraw } from '../web3/hooks/useWithdraw';
import { useRefund } from '../web3/hooks/useRefund';
import StatusMessage from './StatusMessage';

export default function WithdrawRefundButtons({ campaign }) {
  const { address, signer } = useWallet();
  const { withdraw, isBusy: isWithdrawing, state: wState, message: wMsg, explorerUrl: wUrl } = useWithdraw(signer);
  const { refund, isBusy: isRefunding, state: rState, message: rMsg, explorerUrl: rUrl } = useRefund(signer);

  if (!address || !campaign) return null;

  const isOwner = campaign.owner?.toLowerCase() === address.toLowerCase();
  const isTargetMet = Number(campaign.raised ?? campaign.amountCollected ?? 0) >= Number(campaign.target);
  const isExpired = Date.now() >= Number(campaign.deadlineMs);
  const isWithdrawn = campaign.withdrawn;

  // Điều kiện Rút tiền: Chủ chiến dịch + Đạt mục tiêu + Chưa rút
  const canWithdraw = isOwner && isTargetMet && !isWithdrawn;
  
  // Điều kiện Hoàn tiền: Đã hết hạn + Chưa đạt mục tiêu
  // (Thực tế contract sẽ check thêm người dùng có góp hay không)
  const canRefund = isExpired && !isTargetMet;

  if (!canWithdraw && !canRefund) return null;

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #2196f3', borderRadius: '8px', backgroundColor: '#e3f2fd' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Quản lý quỹ</h4>
      
      {canWithdraw && (
        <div>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Chiến dịch đã đạt mục tiêu, bạn có thể rút tiền về ví.</p>
          <button 
            onClick={() => withdraw(campaign.id)} 
            disabled={isWithdrawing || wState === 'confirming'}
            style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isWithdrawing ? 'Đang xử lý...' : 'Rút tiền (Withdraw)'}
          </button>
          <StatusMessage state={wState} message={wMsg} explorerUrl={wUrl} />
        </div>
      )}

      {canRefund && (
        <div>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Chiến dịch đã hết hạn nhưng chưa đạt mục tiêu nên bạn có thể xin hoàn tiền.</p>
          <button 
            onClick={() => refund(campaign.id)} 
            disabled={isRefunding || rState === 'confirming'}
            style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isRefunding ? 'Đang xử lý...' : 'Hoàn tiền (Refund)'}
          </button>
          <StatusMessage state={rState} message={rMsg} explorerUrl={rUrl} />
        </div>
      )}
    </div>
  );
}