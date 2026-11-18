import { useState, useEffect, useCallback } from "react";
import { fetchCampaigns } from "../campaigns";

// provider: lấy từ useWallet (có thể để trống, khi đó chỉ đọc qua RPC công khai)
export function useCampaigns(provider = null) {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // reload(true) = tải lại "âm thầm": cập nhật số liệu nhưng KHÔNG bật isLoading,
  // để danh sách không bị thay bằng chữ "Đang tải..." (giữ nguyên thông báo giao dịch trên thẻ)
  const reload = useCallback(async (silent = false) => {
    try {
      setError("");
      if (silent !== true) setIsLoading(true);
      setCampaigns(await fetchCampaigns(provider));
    } catch (err) {
      setError(err.shortMessage || err.message || "Không tải được danh sách chiến dịch.");
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    reload(); // tự tải khi component xuất hiện
  }, [reload]);

  return { campaigns, isLoading, error, reload };
}