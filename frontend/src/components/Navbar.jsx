import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../web3/hooks/useWallet';

export default function Navbar() {
  const { address, connect, disconnect, isConnecting, error } = useWallet();
  const location = useLocation();

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path
      || (path === '/campaigns' && location.pathname.startsWith('/campaigns/'));

    return {
      textDecoration: 'none',
      color: isActive ? '#007bff' : '#333',
      fontWeight: isActive ? 'bold' : 'normal',
      padding: '8px 12px',
      borderRadius: '6px',
      backgroundColor: isActive ? '#e3f2fd' : 'transparent',
      transition: 'all 0.2s',
    };
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
      flexWrap: 'wrap',
      padding: '16px 24px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '30px',
    }}>
      <Link
        to="/campaigns"
        style={{ textDecoration: 'none', color: '#007bff', fontSize: '24px', fontWeight: 'bold' }}
      >
        Web3Funding
      </Link>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/campaigns" style={getLinkStyle('/campaigns')}>Chiến dịch</Link>
        {address && (
          <>
            <Link to="/create" style={getLinkStyle('/create')}>+ Tạo chiến dịch</Link>
            <Link to="/my-campaigns" style={getLinkStyle('/my-campaigns')}>Quản lý quỹ</Link>
          </>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
        {address ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', background: '#f5f5f5', padding: '6px 12px', borderRadius: '20px' }}>
              Đã kết nối: {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button
              type="button"
              onClick={disconnect}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ff4d4f',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Ngắt kết nối
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={isConnecting}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
            }}
          >
            {isConnecting ? 'Đang kết nối...' : 'Kết nối ví'}
          </button>
        )}
        {error && <span role="alert" style={{ color: '#d32f2f', fontSize: '12px' }}>{error}</span>}
      </div>
    </nav>
  );
}
