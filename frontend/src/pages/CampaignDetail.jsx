import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWallet } from '../web3/hooks/useWallet';
import { useDonate } from '../web3/hooks/useDonate';
import { fetchCampaignById } from '../web3/campaigns';
import WithdrawRefundButtons from '../components/WithdrawRefundButtons';

function getCampaignSummary(campaign) {
  const raisedValue = Number(campaign.raised);
  const raised = Number.isFinite(raisedValue) ? raisedValue : 0;
  const target = Number(campaign.target);
  const hasValidTarget = Number.isFinite(target) && target > 0;
  const deadlineMs = Number(campaign.deadlineMs);
  const ended = Number.isFinite(deadlineMs) && deadlineMs <= Date.now();
  const daysLeft = Number.isFinite(deadlineMs)
    ? Math.max(0, Math.ceil((deadlineMs - Date.now()) / 86400000))
    : 0;
  const reached = hasValidTarget && raised >= target;

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

  return {
    raised,
    target,
    percent: hasValidTarget ? Math.min(100, Math.round((raised / target) * 100)) : 0,
    ended,
    daysLeft,
    reached,
    canDonate: hasValidTarget && !reached && !ended && !campaign.withdrawn,
    status,
    badgeStyle,
  };
}

function getDonationUnavailableMessage(campaign, reached, ended) {
  if (campaign.withdrawn) return 'Chiến dịch đã giải ngân, ngừng nhận quyên góp.';
  if (reached) return 'Chiến dịch đã đạt mục tiêu, không nhận thêm quyên góp.';
  if (ended) return 'Chiến dịch đã kết thúc thời hạn gây quỹ.';
  return 'Chiến dịch chưa có mục tiêu quyên góp hợp lệ.';
}

function getDonationValidationError({ canDonate, address, signer, amount }) {
  if (!canDonate) return 'Chiến dịch không còn nhận quyên góp.';
  if (!address || !signer) return 'Vui lòng kết nối ví MetaMask trước.';

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return 'Số ETH không hợp lệ.';
  }

  return '';
}

function getTransactionMessageColor(state) {
  if (state === 'error') return '#ff4d4f';
  if (state === 'rejected') return '#b26a00';
  return '#2e7d32';
}

function CampaignProgress({ summary, deadline }) {
  const { raised, target, percent, ended, daysLeft, reached } = summary;

  return (
    <div style={{ backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '8px' }}>
        <span>Đã quyên góp: <strong style={{ color: '#007bff' }}>{raised} ETH</strong></span>
        <span>Mục tiêu: <strong>{target} ETH</strong></span>
      </div>
      <div style={{ width: '100%', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: reached ? '#2e7d32' : '#007bff' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
        <span>Đạt {percent}% mục tiêu</span>
        <span>{ended ? 'Đã hết hạn' : `⏳ Còn lại ${daysLeft} ngày (Hạn chót: ${deadline})`}</span>
      </div>
    </div>
  );
}

function DonationSection({
  campaign,
  summary,
  amount,
  setAmount,
  formError,
  isBusy,
  message,
  state,
  explorerUrl,
  onSubmit,
}) {
  const messageColor = getTransactionMessageColor(state);

  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <h3 style={{ marginBottom: '12px' }}>Ủng hộ chiến dịch này</h3>
      {summary.canDonate ? (
        <form onSubmit={onSubmit} style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Nhập số ETH muốn quyên góp (VD: 0.05)"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={isBusy}
              style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
            />
            <button
              type="submit"
              disabled={isBusy}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ff9800',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '15px',
                cursor: isBusy ? 'not-allowed' : 'pointer',
              }}
            >
              {isBusy ? 'Đang xử lý...' : 'Quyên góp ngay'}
            </button>
          </div>
          {formError && <p style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '8px' }}>{formError}</p>}
        </form>
      ) : (
        <div style={{ padding: '14px', backgroundColor: '#f5f5f5', borderRadius: '6px', textAlign: 'center', color: '#666', marginBottom: '16px' }}>
          {getDonationUnavailableMessage(campaign, summary.reached, summary.ended)}
        </div>
      )}

      {message && (
        <div style={{ fontSize: '14px', color: messageColor, marginBottom: '12px' }}>
          {message}{' '}
          {explorerUrl && (
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
              Xem giao dịch trên Etherscan
            </a>
          )}
        </div>
      )}
      <WithdrawRefundButtons campaign={campaign} />
    </div>
  );
}

export default function CampaignDetail() {
  const { id } = useParams();
  const { provider, signer, address } = useWallet();
  const { donate, isBusy, message, explorerUrl, state } = useDonate(signer);
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const loadDetail = useCallback(async () => {
    const campaignId = Number(id);
    setIsLoading(true);
    setError('');

    if (!Number.isSafeInteger(campaignId) || campaignId < 0) {
      setCampaign(null);
      setError('ID chiến dịch không hợp lệ.');
      setIsLoading(false);
      return;
    }

    try {
      setCampaign(await fetchCampaignById(campaignId, provider));
    } catch (loadError) {
      setCampaign(null);
      setError(loadError?.shortMessage || loadError?.message || 'Không thể tải thông tin chiến dịch này.');
    } finally {
      setIsLoading(false);
    }
  }, [id, provider]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    if (state !== 'success') return;
    setAmount('');
    void loadDetail();
  }, [state, loadDetail]);

  const handleDonate = async (event) => {
    event.preventDefault();
    const validationError = getDonationValidationError({ canDonate: summary.canDonate, address, signer, amount });
    setFormError(validationError);
    if (validationError) return;

    await donate(campaign.id, Number(amount).toString());
  };

  if (isLoading) return <p style={{ padding: '20px' }}>Đang tải chi tiết chiến dịch...</p>;
  if (error || !campaign) {
    return <p style={{ padding: '20px', color: 'red' }}>{error || 'Không tìm thấy chiến dịch.'}</p>;
  }

  const summary = getCampaignSummary(campaign);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Link to="/campaigns" style={{ textDecoration: 'none', color: '#007bff', display: 'inline-block', marginBottom: '16px', fontWeight: 'bold' }}>
        ← Quay lại danh sách
      </Link>

      <img
        src={campaign.imageURI || 'https://via.placeholder.com/800x400?text=Tu+Thien+Minh+Bach'}
        alt={campaign.title}
        style={{ width: '100%', maxHeight: '360px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '26px' }}>{campaign.title}</h1>
        <span style={{ ...summary.badgeStyle, padding: '6px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          {summary.status}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
        Chủ chiến dịch: <strong>{campaign.owner}</strong>
      </p>

      <CampaignProgress summary={summary} deadline={campaign.deadline} />

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '8px' }}>Câu chuyện & Mục đích sử dụng quỹ</h3>
        <p style={{ lineHeight: '1.6', color: '#333', whiteSpace: 'pre-line' }}>
          {campaign.description}
        </p>
      </div>

      <DonationSection
        campaign={campaign}
        summary={summary}
        amount={amount}
        setAmount={setAmount}
        formError={formError}
        isBusy={isBusy}
        message={message}
        state={state}
        explorerUrl={explorerUrl}
        onSubmit={handleDonate}
      />
    </div>
  );
}
