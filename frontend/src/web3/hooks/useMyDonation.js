import { useState, useEffect, useCallback } from "react";
import { getMyDonation } from "../campaigns";

// Số ETH mà địa chỉ `address` đã góp cho chiến dịch `id`.
// Dùng để quyết định có hiện nút "Hoàn tiền" hay không (chỉ hoàn được khi > 0).
export function useMyDonation(id, address, provider = null) {
  const [myDonation, setMyDonation] = useState("0"); // chuỗi ETH, ví dụ "0.002"
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    // Chưa có id hoặc chưa kết nối ví thì không gọi contract
    if (id == null || !address) {
      setMyDonation("0");
      setIsLoading(false);
      return;
    }
    try {
      setError("");
      setIsLoading(true);
      setMyDonation(await getMyDonation(id, address, provider));
    } catch (err) {
      setMyDonation("0");
      setError(err.shortMessage || err.message || "Không đọc được số tiền đã góp.");
    } finally {
      setIsLoading(false);
    }
  }, [id, address, provider]);

  useEffect(() => {
    reload(); // tự tải lại khi đổi chiến dịch hoặc đổi tài khoản ví
  }, [reload]);

  return { myDonation, isLoading, error, reload };
}
