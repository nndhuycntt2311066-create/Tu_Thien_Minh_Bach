import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../web3/hooks/useWallet';
import { useDonate } from '../web3/hooks/useDonate';
import { fetchCampaignById } from '../web3/campaigns';
import WithdrawRefundButtons from '../components/WithdrawRefundButtons';
import DonationHistory from '../components/DonationHistory';

export default function CampaignDetail() {
  const { id } = useParams();
  const { provider, signer, address } = useWallet();
  const { donate, isBusy, message, explorerUrl, state } = useDonate(signer);

  // Khóa cả form khi đang gửi, đang xác nhận hoặc đã thành công
  const locked = isBusy || state === 'confirming' || state === 'success';

  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState('');

  const loadDetail = async () => {
    try {
      setError('');
      const data = await fetchCampaignById(id, provider);
      setCampaign(data);
    } catch (err) {
      setError('Không thể tải thông tin chiến dịch này.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id, provider]);

 useEffect(() => {
    if (state === 'success') {
      setAmount('');
      loadDetail(); // Cập nhật ngay lập tức
      const timer = setTimeout(() => loadDetail(), 3000); // Gọi thêm 1 lần sau 3 giây cho RPC kịp đồng bộ
      return () => clearTimeout(timer);
    }
  }, [state]);

  if (isLoading) return <p style={{ padding: '20px' }}>Đang tải chi tiết chiến dịch...</p>;
  if (error || !campaign) return <p style={{ padding: '20px', color: 'red' }}>{error || 'Không tìm thấy chiến dịch.'}</p>;

  const raised = Number(campaign.raised || 0);
  const target = Number(campaign.target);
  const percent = Math.min(100, Math.round((raised / target) * 100));
  const ended = campaign.deadlineMs <= Date.now();
  const daysLeft = Math.max(0, Math.ceil((campaign.deadlineMs - Date.now()) / 86400000));
  const reached = raised >= target;
  const canDonate = !ended && !campaign.withdrawn;

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

  const handleDonate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!canDonate) return setFormError('Chiến dịch không còn nhận quyên góp.');
    if (!address || !signer) return setFormError('Vui lòng kết nối ví MetaMask trước.');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setFormError('Số ETH không hợp lệ.');

    await donate(campaign.id, amount);
  };

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
        <span style={{ ...badgeStyle, padding: '6px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          {status}
        </span>
      </div>

      <p style={{ fontSize: '13px', color: '#888', marginBottom: '20px' }}>
        Chủ chiến dịch: <strong>{campaign.owner}</strong>
      </p>

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
          <span>{ended ? 'Đã hết hạn' : `⏳ Còn lại ${daysLeft} ngày (Hạn chót: ${campaign.deadline})`}</span>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '8px' }}>Câu chuyện & Mục đích sử dụng quỹ</h3>
        <p style={{ lineHeight: '1.6', color: '#333', whiteSpace: 'pre-line' }}>
          {campaign.description}
        </p>
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ marginBottom: '12px' }}>Ủng hộ chiến dịch này</h3>
        {canDonate ? (
          <form onSubmit={handleDonate} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="number"
                step="any"
                placeholder="Nhập số ETH muốn quyên góp (VD: 0.05)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={locked}
                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '15px' }}
              />
              <button
                type="submit"
                disabled={locked}
                style={{ padding: '12px 24px', backgroundColor: locked ? '#ccc' : '#ff9800', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '15px', cursor: locked ? 'not-allowed' : 'pointer' }}
              >
                {isBusy ? 'Đang xử lý...' : 'Quyên góp ngay'}
              </button>
            </div>
            {formError && <p style={{ color: '#ff4d4f', fontSize: '13px', marginTop: '8px' }}>{formError}</p>}
          </form>
        ) : (
          <div style={{ padding: '14px', backgroundColor: '#f5f5f5', borderRadius: '6px', textAlign: 'center', color: '#666', marginBottom: '16px' }}>
            {campaign.withdrawn ? 'Chiến dịch đã giải ngân, ngừng nhận quyên góp.' : 'Chiến dịch đã kết thúc thời hạn gây quỹ.'}
          </div>
        )}

        {message && (
          <div style={{ fontSize: '14px', color: state === 'error' ? '#ff4d4f' : '#2e7d32', marginBottom: '12px' }}>
            {message}{' '}
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                Xem giao dịch trên Etherscan
              </a>
            )}
          </div>
        )}

        <WithdrawRefundButtons campaign={campaign} onChanged={loadDetail} />

        <h4 style={{ margin: '24px 0 8px' }}>Lịch sử quyên góp</h4>
        <DonationHistory campaignId={campaign.id} />
      </div>
    </div>
  );
}