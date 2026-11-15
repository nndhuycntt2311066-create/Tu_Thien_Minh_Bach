// Dịch lỗi của MetaMask/ethers/contract sang tiếng Việt dễ hiểu
export function translateError(err) {
  const text = `${err?.reason ?? ""} ${err?.shortMessage ?? ""} ${err?.message ?? ""}`.toLowerCase();

  if (err?.code === "INSUFFICIENT_FUNDS" || text.includes("insufficient funds"))
    return "Ví không đủ ETH để thanh toán số tiền và phí gas.";
  if (text.includes("deadline") || text.includes("ended") || text.includes("expired"))
    return "Chiến dịch đã hết hạn.";
  if (text.includes("goal") && text.includes("not"))
    return "Chiến dịch chưa đạt mục tiêu nên chưa thực hiện được thao tác này.";
  if (text.includes("already"))
    return "Thao tác này đã được thực hiện trước đó.";
  if (text.includes("not owner") || text.includes("only owner") || text.includes("unauthorized"))
    return "Chỉ chủ chiến dịch mới được thực hiện thao tác này.";
  if (err?.code === "NETWORK_ERROR" || text.includes("network"))
    return "Lỗi mạng. Hãy kiểm tra kết nối rồi thử lại.";
  if (err?.code === "CALL_EXCEPTION")
    return "Giao dịch bị contract từ chối (revert). Kiểm tra lại điều kiện của chiến dịch.";

  // Lỗi do chính code mình ném ra (đã là tiếng Việt) hoặc lỗi chưa biết
  return err?.reason || err?.shortMessage || err?.message || "Giao dịch thất bại.";
}