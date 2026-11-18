import React from 'react';

export default function ShortAddress({ address }) {
  if (!address) return null;
  const shortStr = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  return (
    <a 
      href={`https://sepolia.etherscan.io/address/${address}`} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{ color: '#2196f3', textDecoration: 'none', fontWeight: '500' }}
    >
      {shortStr}
    </a>
  );
}