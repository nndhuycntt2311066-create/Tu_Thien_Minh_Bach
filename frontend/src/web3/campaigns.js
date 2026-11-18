import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "../contracts/config";
import { CROWDFUNDING_ABI } from "../contracts/abi";

// false = đọc dữ liệu thật từ Sepolia
export const USE_MOCK = false;

// Mili-giây -> chuỗi "YYYY-MM-DD" (cùng dạng với mockData.js của C)
const toDateString = (ms) => new Date(ms).toISOString().slice(0, 10);

// Gom dữ liệu về ĐÚNG dạng mà CampaignCard của C đang dùng
function buildCampaign({ id, owner, title, description, imageURI, goal, raised, deadlineMs, withdrawn }) {
  // Các cờ trạng thái này khớp với require trong Crowdfunding.sol
  const isEnded = deadlineMs <= Date.now();               // đã qua hạn chót
  const isGoalReached = Number(raised) >= Number(goal);   // đã đạt (hoặc vượt) mục tiêu
  const canWithdraw = isGoalReached && !withdrawn;        // chủ chiến dịch được rút (withdraw)
  const canRefund = isEnded && !isGoalReached;            // người đã góp được hoàn tiền (refund)
  const active = !isEnded && !isGoalReached && !withdrawn; // nhãn "Đang gây quỹ" của C
  return {
    id,
    owner,
    title,
    description,
    imageURI,
    target: goal,                        // ETH (C dùng tên "target")
    raised,                              // ETH
    deadline: toDateString(deadlineMs),  // "YYYY-MM-DD"
    deadlineMs,
    active,                              // true = "Đang gây quỹ"
    withdrawn,
    isEnded,
    isGoalReached,
    canWithdraw,                         // dùng cùng điều kiện "ví hiện tại là chủ chiến dịch"
    canRefund,                           // dùng cùng điều kiện "tôi đã góp > 0" (useMyDonation)
  };
}

// Provider chỉ đọc: dùng ví nếu có, không thì dùng RPC công khai Sepolia
function getReadProvider(provider) {
  return provider ?? new JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
}

function getContract(provider) {
  return new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, getReadProvider(provider));
}

// ethers v6 trả bigint: formatEther đổi wei -> ETH, Number() đổi giây
function toCampaign(id, c) {
  return buildCampaign({
    id,
    owner: c.owner,
    title: c.title,
    description: c.description,
    imageURI: c.imageURI,
    goal: formatEther(c.goal),
    raised: formatEther(c.amountRaised),
    deadlineMs: Number(c.deadline) * 1000,
    withdrawn: c.withdrawn,
  });
}

export async function fetchCampaigns(provider) {
  const contract = getContract(provider);
  const count = Number(await contract.getCampaignCount());
  if (count === 0) return [];

  // Contract dùng mảng nên id luôn bắt đầu từ 0: 0, 1, ..., count - 1
  const ids = Array.from({ length: count }, (_, i) => i);
  // Đọc song song cho nhanh
  const results = await Promise.all(ids.map((id) => contract.getCampaign(id)));
  return results.map((c, i) => toCampaign(ids[i], c));
}

export async function fetchCampaignById(id, provider) {
  const contract = getContract(provider);
  return toCampaign(Number(id), await contract.getCampaign(id));
}

// Số ETH một địa chỉ đã góp cho một chiến dịch
export async function getMyDonation(id, address, provider) {
  const contract = getContract(provider);
  return formatEther(await contract.donations(id, address));
}
