// ABI NHÁP - chờ A gửi ABI thật rồi thay thế file này
export const CROWDFUNDING_ABI = [
  "function getCampaignCount() view returns (uint256)",
  "function getCampaign(uint256 id) view returns (address owner, string title, uint256 goal, uint256 amountRaised, uint256 deadline, bool withdrawn)",
];