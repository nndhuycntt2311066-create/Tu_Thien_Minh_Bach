// Dịch lỗi của MetaMask/ethers/contract sang tiếng Việt dễ hiểu
export function translateError(err) {
  const text = `${err?.reason ?? ""} ${err?.shortMessage ?? ""} ${err?.message ?? ""}`.toLowerCase();

  // 1. Lỗi từ ví / mạng
  if (err?.code === "ACTION_REJECTED" || err?.code === 4001 || text.includes("user rejected") || text.includes("user denied"))
    return "Bạn đã hủy giao dịch trong MetaMask.";
  if (err?.code === "INSUFFICIENT_FUNDS" || text.includes("insufficient funds"))
    return "Ví không đủ ETH để thanh toán số tiền và phí gas.";
  if (err?.code === "NETWORK_ERROR" || text.includes("network"))
    return "Lỗi mạng. Hãy kiểm tra kết nối rồi thử lại.";

  // 2. Lỗi do contract Crowdfunding.sol (khớp đúng chuỗi require, đặt TRƯỚC các luật chung)
  if (text.includes("only owner") || text.includes("not owner") || text.includes("unauthorized"))
    return "Chỉ chủ chiến dịch mới được thực hiện thao tác này.";
  if (text.includes("campaign still active"))
    return "Chiến dịch chưa hết hạn nên chưa thể hoàn tiền.";
  if (text.includes("goal reached, no refund"))
    return "Chiến dịch đã đạt mục tiêu nên không hoàn tiền.";
  if (text.includes("nothing to refund"))
    return "Bạn chưa góp vào chiến dịch này hoặc đã được hoàn tiền rồi.";
  if (text.includes("goal not reached"))
    return "Chiến dịch chưa đạt mục tiêu nên chưa thể rút tiền.";
  if (text.includes("already withdrawn"))
    return "Chiến dịch này đã được rút tiền rồi.";
  if (text.includes("campaign ended"))
    return "Chiến dịch đã hết hạn, không thể góp thêm.";
  if (text.includes("campaign closed"))
    return "Chiến dịch đã đóng vì chủ chiến dịch đã rút tiền, không thể góp thêm.";
  if (text.includes("send some eth"))
    return "Vui lòng nhập số ETH lớn hơn 0.";
  if (text.includes("campaign does not exist"))
    return "Chiến dịch không tồn tại.";
  if (text.includes("title required"))
    return "Vui lòng nhập tiêu đề chiến dịch.";
  if (text.includes("goal must be"))
    return "Mục tiêu phải lớn hơn 0.";
  if (text.includes("duration must be"))
    return "Thời hạn phải ít nhất 1 ngày.";
  if (text.includes("transfer failed") || text.includes("refund failed"))
    return "Chuyển ETH thất bại, vui lòng thử lại.";

  // 3. Luật chung (dự phòng cho lỗi chưa biết)
  if (text.includes("already"))
    return "Thao tác này đã được thực hiện trước đó.";
  if (err?.code === "CALL_EXCEPTION")
    return "Giao dịch bị contract từ chối (revert). Kiểm tra lại điều kiện của chiến dịch.";

  // Lỗi do chính code mình ném ra (đã là tiếng Việt) hoặc lỗi chưa biết
  return err?.reason || err?.shortMessage || err?.message || "Giao dịch thất bại.";
}
