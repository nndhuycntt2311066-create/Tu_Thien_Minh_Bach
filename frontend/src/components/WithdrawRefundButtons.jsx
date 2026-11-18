import React, { useState, useEffect } from 'react';
import { useWallet } from '../web3/hooks/useWallet';
import { useWithdraw } from '../web3/hooks/useWithdraw';
import { useRefund } from '../web3/hooks/useRefund';
import { getMyDonation } from '../web3/campaigns';
import StatusMessage from './StatusMessage';

export default function WithdrawRefundButtons({ campaign, onChanged }) {
  const { address, signer, provider } = useWallet();
  const { withdraw, isBusy: isWithdrawing, state: wState, message: wMsg, explorerUrl: wUrl } = useWithdraw(signer);
  const { refund, isBusy: isRefunding, state: rState, message: rMsg, explorerUrl: rUrl } = useRefund(signer);
  const [myDonation, setMyDonation] = useState(0);

  const campaignId = campaign?.id;

  // Đọc số ETH mà ví đang kết nối đã góp cho chiến dịch này
  useEffect(() => {
    let cancelled = false;
    if (!address || campaignId === undefined || campaignId === null) {
      setMyDonation(0);
      return;
    }
    getMyDonation(campaignId, address, provider)
      .then((v) => { if (!cancelled) setMyDonation(Number(v)); })
      .catch(() => { if (!cancelled) setMyDonation(0); });
    return () => { cancelled = true; };
  }, [address, campaignId, provider, rState]);

  // Giao dịch thành công thì báo cho trang cha tải lại danh sách
  useEffect(() => {
    if (wState === 'success' || rState === 'success') onChanged?.();
  }, [wState, rState]);

  if (!address || !campaign) return null;

  const isOwner = campaign.owner?.toLowerCase() === address.toLowerCase();
  const isTargetMet = Number(campaign.raised ?? 0) >= Number(campaign.target);
  const isExpired = Date.now() >= Number(campaign.deadlineMs);

  // Rút tiền: chủ chiến dịch, đã đạt mục tiêu, chưa rút
  const canWithdraw = isOwner && isTargetMet && !campaign.withdrawn;
  // Hoàn tiền: đã hết hạn, chưa đạt mục tiêu, và ví này đã góp
  const canRefund = isExpired && !isTargetMet && myDonation > 0;

  // Giữ khối hiển thị sau khi thành công để người dùng còn thấy link Etherscan
  const showWithdraw = canWithdraw || wState === 'success';
  const showRefund = canRefund || rState === 'success';

  if (!showWithdraw && !showRefund) return null;

  return (
    <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #2196f3', borderRadius: '8px', backgroundColor: '#e3f2fd' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Quản lý quỹ</h4>

      {showWithdraw && (
        <div>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Chiến dịch đã đạt mục tiêu, bạn có thể rút tiền về ví.</p>
          <button
            onClick={() => withdraw(campaign.id)}
            disabled={isWithdrawing || !canWithdraw}
            style={{ padding: '10px 20px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isWithdrawing ? 'Đang xử lý...' : 'Rút tiền'}
          </button>
          <StatusMessage state={wState} message={wMsg} explorerUrl={wUrl} />
        </div>
      )}

      {showRefund && (
        <div>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            Chiến dịch đã hết hạn mà chưa đạt mục tiêu. Bạn có thể nhận lại {myDonation} ETH đã góp.
          </p>
          <button
            onClick={() => refund(campaign.id)}
            disabled={isRefunding || !canRefund}
            style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isRefunding ? 'Đang xử lý...' : 'Hoàn tiền'}
          </button>
          <StatusMessage state={rState} message={rMsg} explorerUrl={rUrl} />
        </div>
      )}
    </div>
  );
}