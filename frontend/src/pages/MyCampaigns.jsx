import React from 'react';
import { useWallet } from '../web3/hooks/useWallet';
import { useCampaigns } from '../web3/hooks/useCampaigns';
import CampaignCard from '../components/CampaignCard';

export default function MyCampaigns() {
  const { address } = useWallet();
  const { campaigns, isLoading, error } = useCampaigns();

  if (!address) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Vui lòng kết nối ví để xem chiến dịch của bạn.</div>;
  }

  if (isLoading) return <p style={{ padding: '20px' }}>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</p>;

  // Lọc danh sách chiến dịch do tôi tạo[cite: 2]
  const myCampaigns = campaigns.filter(c => c.owner?.toLowerCase() === address.toLowerCase());

  return (
    <div style={{ padding: '20px' }}>
      <h1>Chiến dịch của tôi</h1>
      {myCampaigns.length === 0 ? (
        <p>Bạn chưa tạo chiến dịch nào.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {myCampaigns.map((campaign, index) => (
            <CampaignCard key={campaign.id || index} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Phần "Chiến dịch tôi đã góp" sẽ làm sau khi phối hợp lấy hook từ Đông[cite: 2] */}
      <div style={{ marginTop: '40px' }}>
        <h2>Chiến dịch tôi đã góp</h2>
        <p style={{ color: '#888', fontStyle: 'italic' }}>Đang chờ phối hợp tích hợp dữ liệu...</p>
      </div>
    </div>
  );
}