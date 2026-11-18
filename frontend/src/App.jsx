import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CampaignCard from './components/CampaignCard';
import CampaignDetail from './components/CampaignDetail';
import CreateCampaign from './components/CreateCampaign';
import MyCampaigns from './pages/MyCampaigns';
import { useCampaigns } from './web3/hooks/useCampaigns';

// Component hiển thị danh sách chiến dịch
const Campaigns = () => {
  const { campaigns, isLoading, error } = useCampaigns();

  if (isLoading) return <p style={{ padding: '20px' }}>Đang tải dữ liệu từ Blockchain...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tất cả chiến dịch</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {campaigns.map((campaign, index) => (
          <CampaignCard key={campaign.id ?? index} campaign={campaign} />
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    // Phải có BrowserRouter bọc ngoài cùng thì Navbar và Routes mới hoạt động
    <BrowserRouter>
      <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
        <Navbar />
        
        <div style={{ padding: '0 24px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/campaigns" replace />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/my-campaigns" element={<MyCampaigns />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;