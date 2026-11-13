// Nạp React để định nghĩa và hiển thị các thành phần giao diện.
import React from 'react';
// Nạp bộ định tuyến để hiển thị nội dung khác nhau theo URL.
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Nạp thanh điều hướng dùng chung ở đầu trang.
import Navbar from './components/Navbar';
// Nạp thẻ hiển thị thông tin của một chiến dịch.
import CampaignCard from './components/CampaignCard';
// Nạp danh sách dữ liệu chiến dịch mẫu từ mockData.js.
import { MOCK_CAMPAIGNS } from './mockData';

// Tạo nội dung trang chủ.
function Home() {
  // Cộng số ETH đã nhận của tất cả chiến dịch để hiển thị thống kê tổng.
  const totalRaised = MOCK_CAMPAIGNS.reduce((total, campaign) => total + Number(campaign.raised), 0);

  // Trả về cấu trúc giao diện trang chủ.
  return (
    // Phần tử bao ngoài giúp căn chỉnh chiều rộng nội dung trang.
    <main className="page-shell">
      {/* Khu vực giới thiệu chính của trang chủ. */}
      <section className="hero">
        {/* Gom tiêu đề, mô tả và nút xem chiến dịch. */}
        <div className="hero-copy">
          {/* Nhãn nhỏ phía trên tiêu đề chính. */}
          <p className="eyebrow">Minh bạch từ tấm lòng</p>
          {/* Tiêu đề chính; br xuống dòng và span tạo kiểu riêng cho dòng hai. */}
          <h1>Trao yêu thương,<br /><span>thấy rõ hành trình.</span></h1>
          {/* Mô tả ngắn về mục tiêu của ứng dụng. */}
          <p className="hero-description">
            Mỗi khoản đóng góp đều được ghi nhận rõ ràng. Cùng cộng đồng đưa sự giúp đỡ đến đúng nơi cần.
          </p>
          {/* Liên kết chuyển người dùng đến danh sách chiến dịch. */}
          <a className="button button-primary" href="/campaigns">Khám phá chiến dịch <span aria-hidden="true">↗</span></a>
        </div>
        {/* Khung thống kê; aria-label mô tả nội dung cho công cụ hỗ trợ. */}
        <aside className="hero-note" aria-label="Thống kê quyên góp">
          {/* Ký hiệu trang trí, được ẩn khỏi trình đọc màn hình. */}
          <span className="note-mark" aria-hidden="true">✳</span>
          {/* Giới thiệu số liệu quyên góp bên dưới. */}
          <p className="note-label">Cộng đồng đã đóng góp</p>
          {/* Hiển thị tổng ETH, định dạng một chữ số thập phân. */}
          <p className="note-total">{totalRaised.toFixed(1)} <span>ETH</span></p>
          {/* Giải thích ngắn về tính công khai của số liệu. */}
          <p className="note-caption">được ghi nhận công khai trên từng chiến dịch</p>
          {/* Đường kẻ dùng để phân tách hai nhóm thống kê. */}
          <div className="note-rule" />
          {/* Hiển thị số lượng chiến dịch trong dữ liệu mẫu. */}
          <p className="note-caption">{MOCK_CAMPAIGNS.length} chiến dịch đang được theo dõi</p>
        </aside>
      </section>
      {/* Khu vực giới thiệu một số chiến dịch nổi bật. */}
      <section className="campaign-section">
        {/* Tiêu đề khu vực và liên kết tới toàn bộ chiến dịch. */}
        <div className="section-heading">
          <div>
            {/* Nhãn phụ cho danh sách chiến dịch. */}
            <p className="eyebrow">Cùng chung tay</p>
            {/* Tiêu đề của khu vực chiến dịch nổi bật. */}
            <h2>Chiến dịch nổi bật</h2>
          </div>
          {/* Mở trang liệt kê đầy đủ chiến dịch. */}
          <a className="text-link" href="/campaigns">Xem tất cả <span aria-hidden="true">→</span></a>
        </div>
        {/* Lưới dùng để sắp xếp các thẻ chiến dịch. */}
        <div className="campaign-grid">
          {/* Chỉ lấy tối đa hai chiến dịch đầu tiên làm nội dung nổi bật. */}
          {MOCK_CAMPAIGNS.slice(0, 2).map((campaign) => (
            // Tạo một thẻ cho mỗi chiến dịch; id giúp React nhận diện từng thẻ.
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>
      {/* Chân trang chứa tên và thông điệp của ứng dụng. */}
      <footer className="site-footer">
        {/* Tên thương hiệu. */}
        <span>Minh Bạch</span>
        {/* Câu thông điệp ở cuối trang. */}
        <span>Góp yêu thương, giữ trọn niềm tin.</span>
      </footer>
    </main>
  );
}

// Tạo trang liệt kê tất cả chiến dịch.
function Campaigns() {
  // Trả về phần giới thiệu, danh sách và chân trang của trang chiến dịch.
  return (
    // Lớp page-shell căn giữa; campaign-page áp dụng bố cục riêng cho trang này.
    <main className="page-shell campaign-page">
      {/* Phần tiêu đề giới thiệu trang chiến dịch. */}
      <section className="campaign-intro">
        {/* Nhãn nhỏ cho phần giới thiệu. */}
        <p className="eyebrow">Sức mạnh từ cộng đồng</p>
        {/* Tiêu đề lớn của trang; br xuống dòng và span tạo kiểu dòng hai. */}
        <h1>Những điều tốt đẹp<br /><span>đang được bắt đầu.</span></h1>
        {/* Hướng dẫn ngắn về danh sách và tiến độ gây quỹ. */}
        <p className="hero-description">Chọn một hành trình để đồng hành. Tiến độ gây quỹ được cập nhật rõ ràng cho mọi người.</p>
      </section>
      {/* Phần chứa tiêu đề số lượng và các thẻ chiến dịch. */}
      <section className="campaign-section">
        {/* Hiển thị tên danh sách và tổng số chiến dịch hiện có. */}
        <div className="section-heading">
          <h2>Tất cả chiến dịch <span className="result-count">{MOCK_CAMPAIGNS.length}</span></h2>
        </div>
        {/* Lưới hiển thị chiến dịch theo dữ liệu mock. */}
        <div className="campaign-grid">
          {/* Duyệt qua toàn bộ chiến dịch và tạo một thẻ cho mỗi mục. */}
          {MOCK_CAMPAIGNS.map((campaign) => (
            // Truyền dữ liệu chiến dịch xuống component CampaignCard qua prop campaign.
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>
      {/* Chân trang của trang chiến dịch. */}
      <footer className="site-footer">
        {/* Tên thương hiệu. */}
        <span>Minh Bạch</span>
        {/* Thông điệp cuối trang. */}
        <span>Góp yêu thương, giữ trọn niềm tin.</span>
      </footer>
    </main>
  );
}

// Thành phần gốc, nơi ghép điều hướng và cấu hình các đường dẫn.
function App() {
  // Bọc ứng dụng trong bộ định tuyến của React Router.
  return (
    <BrowserRouter>
      {/* Thanh điều hướng xuất hiện trên các trang. */}
      <Navbar />
      {/* Chọn nội dung route phù hợp với địa chỉ URL hiện tại. */}
      <Routes>
        {/* URL gốc hiển thị trang chủ. */}
        <Route path="/" element={<Home />} />
        {/* URL /campaigns hiển thị danh sách chiến dịch. */}
        <Route path="/campaigns" element={<Campaigns />} />
      </Routes>
    </BrowserRouter>
  );
}

// Cho phép main.jsx nhập và hiển thị thành phần App.
export default App;