import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../web3/hooks/useWallet';
import { useCreateCampaign } from '../web3/hooks/useCreateCampaign';
import StatusMessage from './StatusMessage'; 

const CreateCampaign = () => {
  const navigate = useNavigate();
  // 1. Lấy signer từ ví
  const { signer } = useWallet();
  // 2. Lấy hàm tạo chiến dịch và các trạng thái từ hook
  const { createCampaign, isBusy, state: txState, message: txMessage, explorerUrl, reset } = useCreateCampaign(signer);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageURI: '',
    targetAmount: '',
    days: '' // Đổi từ deadline sang số ngày theo đúng hợp đồng
  });
  const [formError, setFormError] = useState('');

  // Tự động chuyển hướng về /campaigns khi tạo thành công
  useEffect(() => {
    if (txState === 'success') {
      const timer = setTimeout(() => navigate('/campaigns'), 2000);
      return () => clearTimeout(timer);
    }
  }, [txState, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Kiểm tra dữ liệu chuẩn theo yêu cầu của lộ trình
    if (!signer) {
      setFormError('Vui lòng kết nối ví MetaMask trước khi tạo chiến dịch!');
      return;
    }

    if (!formData.title.trim()) {
      setFormError('Tiêu đề không được để trống!');
      return;
    }
    
    const goal = Number(formData.targetAmount);
    if (!Number.isFinite(goal) || goal <= 0) {
      setFormError('Mục tiêu ETH phải lớn hơn 0!');
      return;
    }

    const daysNum = Number(formData.days);
    if (!Number.isInteger(daysNum) || daysNum < 1) {
      setFormError('Số ngày diễn ra phải là số nguyên và lớn hơn hoặc bằng 1!');
      return;
    }

    reset();
    
    // 3. Gọi hàm từ hook thay vì gọi ethers trực tiếp
    await createCampaign({
      title: formData.title,
      description: formData.description,
      imageURI: formData.imageURI,
      goalEth: formData.targetAmount.toString(),
      days: formData.days.toString()
    });
  };

  const statusMsg = formError || txMessage || {
    confirming: 'Vui lòng xác nhận giao dịch trên MetaMask...',
    pending: 'Đang tạo chiến dịch trên mạng lưới Sepolia...',
    success: 'Tạo thành công! Đang chuyển về trang danh sách...'
  }[txState] || '';

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Tạo Chiến Dịch Mới</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
        <input 
          type="text" name="title" placeholder="Tên chiến dịch" 
          value={formData.title} onChange={handleChange} required 
          disabled={isBusy || txState === 'confirming'}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <textarea 
          name="description" placeholder="Mô tả chi tiết..." 
          value={formData.description} onChange={handleChange} required rows="3"
          disabled={isBusy || txState === 'confirming'}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        
        <input 
          type="url" name="imageURI" placeholder="Link hình ảnh (URL)" 
          value={formData.imageURI} onChange={handleChange} required 
          disabled={isBusy || txState === 'confirming'}
          style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        {/* Khối hiển thị ảnh xem trước */}
        {formData.imageURI && (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={formData.imageURI} alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} 
              onError={(e) => e.target.style.display = 'none'}
              onLoad={(e) => e.target.style.display = 'inline-block'}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            type="number" name="targetAmount" placeholder="Mục tiêu (ETH)" 
            value={formData.targetAmount} onChange={handleChange} required step="0.0001" min="0"
            disabled={isBusy || txState === 'confirming'}
            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
          <input 
            type="number" name="days" placeholder="Số ngày (VD: 30)" 
            value={formData.days} onChange={handleChange} required min="1" step="1"
            disabled={isBusy || txState === 'confirming'}
            style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isBusy || txState === 'confirming' || !signer}
          style={{ 
            padding: '1rem', 
            backgroundColor: (isBusy || txState === 'confirming' || !signer) ? '#999' : '#007bff', 
            color: 'white', border: 'none', borderRadius: '4px', 
            cursor: (isBusy || txState === 'confirming' || !signer) ? 'not-allowed' : 'pointer', 
            fontWeight: 'bold' 
          }}
        >
          {txState === 'pending' ? 'Đang xử lý...' : isBusy ? 'Đang xác nhận...' : 'Xác Nhận Tạo'}
        </button>
      </form>

      {/* Tích hợp component StatusMessage chuẩn thay cho div thông báo cũ */}
      <StatusMessage 
        state={formError ? 'error' : txState} 
        message={statusMsg} 
        explorerUrl={explorerUrl} 
      />
    </div>
  );
};

export default CreateCampaign;