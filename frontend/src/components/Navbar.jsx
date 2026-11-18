import React from 'react';
import { Link } from 'react-router-dom';
// Import hook kết nối ví của B
import { useWallet } from '../web3/hooks/useWallet';

export default function Navbar() {
  // Lấy hàm connect và thông tin ví từ hook
  const { connect, address, isConnected } = useWallet();

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fff', borderBottom: '1px solid #ccc' }}>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Trang Chủ</Link>
        <Link to="/campaigns" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>Chiến dịch</Link>
      </div>
      
      {/* Nút gọi MetaMask */}
      <button 
        onClick={connect} 
        style={{ 
          padding: '10px 16px', cursor: 'pointer', border: 'none', borderRadius: '4px', fontWeight: 'bold',
          background: isConnected ? '#4CAF50' : '#2196F3', 
          color: 'white' 
        }}
      >
       {isConnected && address ? `Đã kết nối: ${address.slice(0, 6)}...${address.slice(-4)}` : 'Kết nối Ví MetaMask'}
      </button>
    </nav>
  );
}