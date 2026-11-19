import React, { useState } from 'react';

// Ảnh dự phòng dạng SVG nhúng sẵn: luôn hiển thị được, không phụ thuộc mạng
const FALLBACK_SRC = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">' +
  '<rect width="800" height="400" fill="#eef3fb"/>' +
  '<text x="400" y="205" font-family="Arial, sans-serif" font-size="32" fill="#5b7db1" text-anchor="middle">Từ Thiện Minh Bạch</text>' +
  '</svg>'
);

// Chỉ nhận link ảnh http(s)
const isValidUrl = (url) => typeof url === 'string' && /^https?:\/\//i.test(url.trim());

export default function CampaignImage({ src, alt, style }) {
  // Nhớ link nào đã tải lỗi; đổi sang chiến dịch khác (link khác) thì tự thử lại
  const [failedSrc, setFailedSrc] = useState(null);

  // Link rỗng, không hợp lệ hoặc đã tải lỗi thì dùng ảnh dự phòng
  const useFallback = !isValidUrl(src) || failedSrc === src;

  return (
    <img
      src={useFallback ? FALLBACK_SRC : src.trim()}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      style={style}
    />
  );
}