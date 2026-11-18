import React, { useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import CampaignCard from './components/CampaignCard';
import CampaignDetail from './pages/CampaignDetail';
import CreateCampaign from './components/CreateCampaign';
import MyCampaigns from './pages/MyCampaigns';
import { useCampaigns } from './web3/hooks/useCampaigns';

const Campaigns = () => {
  const { campaigns, isLoading, error, reload } = useCampaigns();
  const reloadCampaigns = useCallback(() => reload(true), [reload]);

  // Chỉ hiện chữ đang tải ở lần đầu tiên (campaigns.length === 0)
  if (isLoading && campaigns.length === 0) {
    return <p style={{ padding: '20px' }}>Đang tải dữ liệu từ Blockchain...</p>;
  }
  
  if (error) {
    return <p style={{ padding: '20px', color: 'red' }}>Lỗi: {error}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Tất cả chiến dịch</h1>
      {campaigns.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px', marginTop: '20px' }}>
          <p style={{ color: '#666', marginBottom: '12px' }}>Chưa có chiến dịch nào được tạo.</p>
          <Link to="/create" style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}>
            + Tạo chiến dịch đầu tiên ngay
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {campaigns.map((campaign, index) => (
            <CampaignCard key={campaign.id ?? index} campaign={campaign} onChanged={reloadCampaigns} />
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
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