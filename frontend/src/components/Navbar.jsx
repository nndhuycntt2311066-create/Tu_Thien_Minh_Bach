import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../web3/hooks/useWallet';

export default function Navbar() {
  const { address, connect, disconnect, isConnecting, error } = useWallet();
  const location = useLocation();

  const getLinkStyle = (path) => ({
    textDecoration: 'none',
    color: location.pathname === path ? '#007bff' : '#333',
    fontWeight: location.pathname === path ? 'bold' : 'normal',
    padding: '8px 12px',
    borderRadius: '6px',
    backgroundColor: location.pathname === path ? '#e3f2fd' : 'transparent',
  });

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
      
      <Link to="/campaigns" style={{ textDecoration: 'none', color: '#007bff', fontSize: '24px', fontWeight: 'bold' }}>
        🚀 Từ Thiện Minh Bạch
      </Link>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <Link to="/campaigns" style={getLinkStyle('/campaigns')}>Trang chủ</Link>
        <Link to="/create" style={getLinkStyle('/create')}>+ Tạo chiến dịch</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {address ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', background: '#f5f5f5', padding: '6px 12px', borderRadius: '20px' }}>
              🟢 {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button
              onClick={disconnect}
              style={{ padding: '8px 16px', backgroundColor: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Ngắt kết nối
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: isConnecting ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {isConnecting ? 'Đang kết nối...' : '🔗 Kết nối ví'}
          </button>
        )}

        {error && (
          <span style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '6px' }}>
            {error}
          </span>
        )}
      </div>
    </nav>
  );
}