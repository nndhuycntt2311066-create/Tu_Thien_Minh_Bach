import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../web3/hooks/useWallet';
import { useDonate } from '../web3/hooks/useDonate';
import WithdrawRefundButtons from './WithdrawRefundButtons';

export default function CampaignCard({ campaign, onChanged }) {
  const { signer, address } = useWallet();
  const { donate, isBusy, message, explorerUrl, state } = useDonate(signer);

  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (state === 'success') {
      setAmount('');
      onChanged?.();
    }
  }, [state]);

  const raised = Number(campaign.raised || 0);
  const target = Number(campaign.target);
  const percent = Math.min(100, Math.round((raised / target) * 100));
  const ended = campaign.deadlineMs <= Date.now();
  const daysLeft = Math.max(0, Math.ceil((campaign.deadlineMs - Date.now()) / 86400000));
  const reached = raised >= target;

  let status = 'Đang gây quỹ';
  let badgeStyle = { backgroundColor: '#e3f2fd', color: '#007bff' };

  if (campaign.withdrawn) {
    status = 'Đã giải ngân';
    badgeStyle = { backgroundColor: '#f5f5f5', color: '#595959' };
  } else if (reached) {
    status = 'Đã đạt mục tiêu';
    badgeStyle = { backgroundColor: '#e8f5e9', color: '#2e7d32' };
  } else if (ended) {
    status = 'Đã kết thúc';
    badgeStyle = { backgroundColor: '#ffebee', color: '#c62828' };
  }

  const canDonate = !ended && !campaign.withdrawn;

  const handleDonate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!canDonate) {
      setFormError('Chiến dịch không còn nhận quyên góp.');
      return;
    }
    if (!address || !signer) {
      setFormError('Vui lòng kết nối ví MetaMask trước khi quyên góp.');
      return;
    }
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setFormError('Vui lòng nhập số ETH hợp lệ (lớn hơn 0).');
      return;
    }

    await donate(campaign.id, amount);
  };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <img
          src={campaign.imageURI || 'https://via.placeholder.com/600x400?text=Tu+Thien+Minh+Bach'}
          alt={campaign.title}
          style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <Link to={`/campaigns/${campaign.id}`} style={{ textDecoration: 'none', color: '#111', fontSize: '18px', fontWeight: 'bold' }}>
            {campaign.title}
          </Link>
          <span style={{ ...badgeStyle, padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {status}
          </span>
        </div>

        <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {campaign.description}
        </p>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
            <span>Đã gom: <strong>{raised} ETH</strong></span>
            <span>Mục tiêu: <strong>{target} ETH</strong></span>
          </div>

          <div style={{ width: '100%', height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
            <div style={{ width: `${percent}%`, height: '100%', backgroundColor: reached ? '#2e7d32' : '#007bff', transition: 'width 0.3s' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
            <span>Đạt {percent}%</span>
            <span>{ended ? 'Đã hết hạn' : `⏳ Còn ${daysLeft} ngày`}</span>
          </div>
        </div>
      </div>

      <div>
        {canDonate ? (
          <form onSubmit={handleDonate} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="any"
                placeholder="Số ETH (VD: 0.01)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isBusy}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <button
                type="submit"
                disabled={isBusy}
                style={{ padding: '8px 14px', backgroundColor: '#ff9800', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isBusy ? 'not-allowed' : 'pointer' }}
              >
                {isBusy ? 'Đang gửi...' : 'Quyên góp'}
              </button>
            </div>

            {formError && (
              <p style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '6px', marginBottom: 0 }}>
                {formError}
              </p>
            )}
          </form>
        ) : (
          <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '6px', textAlign: 'center', color: '#666', fontSize: '13px', marginBottom: '10px' }}>
            {campaign.withdrawn ? 'Chiến dịch đã giải ngân, ngừng nhận quyên góp.' : 'Chiến dịch đã kết thúc thời hạn gây quỹ.'}
          </div>
        )}

        {message && (
          <div style={{ fontSize: '12px', color: state === 'error' ? '#ff4d4f' : '#2e7d32', marginBottom: '8px' }}>
            {message}{' '}
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                Xem trên Etherscan
              </a>
            )}
          </div>
        )}

        <WithdrawRefundButtons campaign={campaign} />
      </div>
    </div>
  );
}