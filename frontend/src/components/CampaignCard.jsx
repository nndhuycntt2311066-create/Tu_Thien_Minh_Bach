import React from 'react';
import { Link } from 'react-router-dom';

export default function CampaignCard({ campaign }) {
  const target = Number(campaign?.target) || 0;
  const raised = Number(campaign?.raised) || 0;
  const progress = target > 0 ? Math.min((raised / target) * 100, 100) : 0;

  return (
    <article className="campaign-card">
      <div className={`campaign-art campaign-art-${campaign?.id % 2}`} aria-hidden="true">
        <span className="art-index">DỰ ÁN / {String(campaign?.id ?? 0).padStart(2, '0')}</span>
        <span className="art-symbol">{campaign?.id % 2 ? '✳' : '⌂'}</span>
        <span className="art-caption">GIEO MẦM<br />TƯƠNG LAI</span>
      </div>
      <div className="campaign-content">
        <div className="campaign-meta">
          <span className={campaign?.active ? 'status status-active' : 'status status-complete'}>
            {campaign?.active ? 'Đang gây quỹ' : 'Đã hoàn thành'}
          </span>
          <span className="campaign-deadline">Đến {campaign?.deadline}</span>
        </div>
        <h3>{campaign?.title || 'Tên chiến dịch'}</h3>
        <p className="campaign-description">{campaign?.description || 'Mô tả chi tiết về chiến dịch.'}</p>
        <progress className="progress-track" aria-label={`Tiến độ ${campaign?.title}`} value={progress} max="100" />
        <div className="funding-row">
          <span><strong>{raised.toFixed(1)}</strong> ETH đã góp</span>
          <span>Mục tiêu <strong>{target.toFixed(1)} ETH</strong></span>
        </div>
        <Link className="campaign-link" to="/campaigns">Xem chiến dịch <span aria-hidden="true">→</span></Link>
      </div>
    </article>
  );
}