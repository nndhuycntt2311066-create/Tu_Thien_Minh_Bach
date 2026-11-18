import React from 'react';
import { useParams } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import ProgressBar from '../components/ProgressBar';
import Countdown from '../components/Countdown';
import ShortAddress from '../components/ShortAddress';
import DonateForm from '../components/DonateForm'; // Form nhập ETH đã tạo ở Giai đoạn 3
import WithdrawRefundButtons from '../components/WithdrawRefundButtons'; // Nút Rút/Hoàn vừa tạo ở Giai đoạn 5
import { useCampaigns } from '../web3/hooks/useCampaigns'; 
import DonationHistory from '../components/DonationHistory';

export default function CampaignDetail() {
  // Lấy ID chiến dịch từ đường dẫn URL
  const { id } = useParams();
  
  // Gọi dữ liệu danh sách chiến dịch
  const { campaigns, isLoading } = useCampaigns();
  
  // Tìm chiến dịch có ID khớp với URL
  const campaign = campaigns.find(c => Number(c.id) === Number(id));

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải dữ liệu...</div>;
  }

  if (!campaign) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Không tìm thấy chiến dịch này hoặc dữ liệu đang được đồng bộ.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Ảnh cover */}
      {campaign.imageURI ? (
        <img 
          src={campaign.imageURI} 
          alt={campaign.title} 
          style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }} 
        />
      ) : (
        <div style={{ width: '100%', height: '400px', background: '#f5f5f5', borderRadius: '12px', marginBottom: '20px' }} />
      )}
      
      {/* Tiêu đề & Nhãn trạng thái */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: '0 0 10px 0' }}>{campaign.title}</h1>
        <StatusBadge campaign={campaign} />
      </div>
      
      {/* Địa chỉ chủ chiến dịch */}
      <p style={{ color: '#666', fontSize: '14px' }}>
        Tạo bởi: <ShortAddress address={campaign.owner} />
      </p>

      {/* Khối thống kê Tiến độ */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
        <p style={{ margin: '4px 0' }}><strong>Mục tiêu:</strong> {campaign.target} ETH</p>
        <p style={{ margin: '4px 0' }}><strong>Đã gom:</strong> {campaign.raised ?? campaign.amountCollected ?? 0} ETH</p>
        <ProgressBar raised={campaign.raised ?? campaign.amountCollected} target={campaign.target} />
        {campaign.deadlineMs != null && (
          <div style={{ marginTop: '10px' }}><Countdown deadlineMs={campaign.deadlineMs} /></div>
        )}
      </div>

      {/* Mô tả chi tiết */}
      <div style={{ marginBottom: '30px', lineHeight: '1.6' }}>
        <h3>Mô tả chi tiết</h3>
        <p>{campaign.description}</p>
      </div>

      {/* Tích hợp Nút Rút/Hoàn tiền (Sẽ tự ẩn nếu không đủ điều kiện) */}
      <WithdrawRefundButtons campaign={campaign} />

      {/* Tích hợp Form Quyên góp (Sẽ tự ẩn nếu hết hạn) */}
      <DonateForm campaign={campaign} />

      {/* Chỗ trống cho Bảng lịch sử quyên góp sau này */}
      <div style={{ marginTop: '40px' }}>
        <h3>Lịch sử quyên góp</h3>
        <DonationHistory campaignId={campaign.id} />
      </div>
    </div>
  );
}