export const getCampaignStatus = (campaign) => {
  if (!campaign) return 'Đang chạy';
  if (campaign.withdrawn) return 'Đã rút';
  if (Number(campaign.raised || campaign.amountCollected) >= Number(campaign.target)) return 'Đạt mục tiêu';
  if (Date.now() >= Number(campaign.deadlineMs)) return 'Hết hạn';
  return 'Đang chạy';
};