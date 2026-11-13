// Nạp React để viết component giao diện bằng JSX.
import React from 'react';
// Link điều hướng không tải lại trang; NavLink còn nhận biết liên kết đang hoạt động.
import { Link, NavLink } from 'react-router-dom';

// Khai báo và xuất component thanh điều hướng để các trang khác sử dụng.
export default function Navbar() {
  // Trả về toàn bộ nội dung và cấu trúc của thanh điều hướng.
  return (
    // Thẻ nav bao quanh các liên kết điều hướng chính của website.
    <nav className="site-nav">
      {/* Logo thương hiệu; nhấn vào sẽ quay về trang chủ. */}
      <Link className="brand" to="/" aria-label="Minh Bạch, trang chủ">
        {/* Chữ cái tạo biểu tượng logo; ẩn biểu tượng này khỏi trình đọc màn hình. */}
        <span className="brand-mark" aria-hidden="true">m</span>
        {/* Tên thương hiệu hiển thị cạnh biểu tượng logo. */}
        <span>minh bạch</span>
      </Link>
      {/* Nhóm các liên kết chuyển đổi giữa những trang chính. */}
      <div className="nav-links">
        {/* Liên kết trang chủ; thuộc tính end chỉ đánh dấu active khi URL đúng là /. */}
        <NavLink to="/" end>Trang chủ</NavLink>
        {/* Liên kết tới trang liệt kê các chiến dịch. */}
        <NavLink to="/campaigns">Chiến dịch</NavLink>
      </div>
      {/* Nút kêu gọi hành động, đưa người dùng tới danh sách chiến dịch. */}
      <a className="nav-action" href="/campaigns">Ủng hộ ngay <span aria-hidden="true">↗</span></a>
    </nav>
  );
}