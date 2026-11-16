import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CampaignCard from './components/CampaignCard';
// Lấy dữ liệu thật từ hook của B
import { useCampaigns } from './web3/hooks/useCampaigns'; 

const Home = () => (
  <div style={{ padding: '20px' }}>
    <h1>Trang Chủ</h1>
    <p>Chào mừng đến với DApp Từ Thiện Minh Bạch!</p>
  </div>
);

const Campaigns = () => {
  // Gọi hook của B
  const { campaigns, isLoading, error } = useCampaigns();

  // Hiện chữ đang tải trong lúc chờ mạng lưới phản hồi
  if (isLoading) return <p style={{ padding: '20px' }}>Đang tải dữ liệu từ Blockchain...</p>;
  // Hiện lỗi nếu rớt mạng hoặc contract có vấn đề
  if (error) return <p style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tất cả chiến dịch</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Lặp qua danh sách thật */}
        {campaigns.map((campaign, index) => (
          <CampaignCard key={campaign.id || index} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/campaigns" element={<Campaigns />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;