import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../web3/hooks/useWallet';
import { useDonate } from '../web3/hooks/useDonate';
import WithdrawRefundButtons from './WithdrawRefundButtons';
import CampaignImage from './CampaignImage';

function getUnavailableMessage(campaign, reached, ended) {
  if (campaign.withdrawn) return 'Chiến dịch đã giải ngân, ngừng nhận quyên góp.';
  if (reached) return 'Chiến dịch đã đạt mục tiêu, không nhận thêm quyên góp.';
  if (ended) return 'Chiến dịch đã kết thúc thời hạn gây quỹ.';
  return 'Chiến dịch chưa có mục tiêu quyên góp hợp lệ.';
}

function getTransactionMessage(state, message) {
  if (message) return message;

  const messages = {
    confirming: 'Vui lòng xác nhận giao dịch trên MetaMask...',
    pending: 'Giao dịch đã gửi, đang chờ xác nhận...',
    success: 'Quyên góp thành công! Cảm ơn tấm lòng của bạn.',
  };
  return messages[state] || '';
}

function getCampaignStatus(campaign, reached, ended) {
  if (campaign.withdrawn) return 'Đã giải ngân';
  if (reached) return 'Đã đạt mục tiêu';
  if (ended) return 'Đã kết thúc';
  return 'Đang gây quỹ';
}

function getBadgeStyle(campaign, reached, ended) {
  if (campaign.withdrawn) return { backgroundColor: '#f5f5f5', color: '#595959' };
  if (reached) return { backgroundColor: '#e8f5e9', color: '#2e7d32' };
  if (ended) return { backgroundColor: '#ffebee', color: '#c62828' };
  return { backgroundColor: '#e3f2fd', color: '#007bff' };
}

function getTransactionColor(state) {
  if (state === 'error') return '#ff4d4f';
  if (state === 'rejected') return '#b26a00';
  return '#2e7d32';
}

function getDonateButtonLabel(state, isBusy) {
  if (state === 'pending') return 'Đang xử lý...';
  if (isBusy) return 'Đang xác nhận...';
  return 'Quyên góp';
}

export default function CampaignCard({ campaign, onChanged }) {
  const { signer, address } = useWallet();
  const {
    donate,
    isBusy,
    message,
    explorerUrl,
    state,
    reset,
  } = useDonate(signer);
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (state !== 'success') return undefined;

    setAmount('');
    void onChanged?.();

    const timer = setTimeout(() => {
      void onChanged?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [state, onChanged]);

  const raisedValue = Number(campaign.raised ?? campaign.amountCollected ?? 0);
  const raised = Number.isFinite(raisedValue) ? raisedValue : 0;
  const target = Number(campaign.target);
  const hasValidTarget = Number.isFinite(target) && target > 0;
  const percent = hasValidTarget ? Math.min(100, Math.round((raised / target) * 100)) : 0;
  const deadlineMs = Number(campaign.deadlineMs);
  const ended = Number.isFinite(deadlineMs) && deadlineMs <= Date.now();
  const daysLeft = Number.isFinite(deadlineMs)
    ? Math.max(0, Math.ceil((deadlineMs - Date.now()) / 86400000))
    : 0;
  const reached = hasValidTarget && raised >= target;
  const canDonate = hasValidTarget && !reached && !ended && !campaign.withdrawn;
  const status = getCampaignStatus(campaign, reached, ended);
  const badgeStyle = getBadgeStyle(campaign, reached, ended);

  const handleDonate = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!canDonate) {
      setFormError('Chiến dịch không còn nhận quyên góp.');
      return;
    }
    if (!address || !signer) {
      setFormError('Vui lòng kết nối ví MetaMask trước khi quyên góp.');
      return;
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFormError('Vui lòng nhập số ETH hợp lệ (lớn hơn 0).');
      return;
    }

    reset();
    await donate(campaign.id, numericAmount.toString());
  };

  const transactionMessage = getTransactionMessage(state, message);
  const transactionColor = getTransactionColor(state);

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '10px',
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}>
      <div>
          <CampaignImage
          src={campaign.imageURI}
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
                min="0"
                step="any"
                placeholder="Số ETH (VD: 0.01)"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={isBusy}
                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              <button
                type="submit"
                disabled={isBusy}
                style={{
                  padding: '8px 14px',
                  backgroundColor: isBusy ? '#ccc' : '#ff9800',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                }}
              >
                {getDonateButtonLabel(state, isBusy)}
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
            {getUnavailableMessage(campaign, reached, ended)}
          </div>
        )}

        {transactionMessage && (
          <div style={{ fontSize: '12px', color: transactionColor, marginBottom: '8px' }}>
            {transactionMessage}{' '}
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
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
