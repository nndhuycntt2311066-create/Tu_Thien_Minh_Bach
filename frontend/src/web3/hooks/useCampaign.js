import { useState, useEffect, useCallback } from "react";
import { fetchCampaignById } from "../campaigns";

// Đọc MỘT chiến dịch theo id (cho trang chi tiết). Không cần ví.
// provider: lấy từ useWallet (có thể để trống, khi đó đọc qua RPC công khai)
export function useCampaign(id, provider = null) {
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    // id = 0 là hợp lệ, chỉ bỏ qua khi chưa có id (undefined / null)
    if (id == null) {
      setIsLoading(false);
      return;
    }
    try {
      setError("");
      setIsLoading(true);
      setCampaign(await fetchCampaignById(id, provider));
    } catch (err) {
      setError(err.shortMessage || err.message || "Không tải được chiến dịch.");
    } finally {
      setIsLoading(false);
    }
  }, [id, provider]);

  useEffect(() => {
    reload(); // tự tải khi component xuất hiện hoặc khi id đổi
  }, [reload]);

  return { campaign, isLoading, error, reload };
}
