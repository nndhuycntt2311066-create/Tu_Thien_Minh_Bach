import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "../contracts/config";
import { CROWDFUNDING_ABI } from "../contracts/abi";

// true = dùng dữ liệu giả; đổi thành false khi A deploy xong và đã điền CONTRACT_ADDRESS
export const USE_MOCK = true;

// Dữ liệu giả cùng dạng với dữ liệu thật (goal/raised là ETH, deadline là mili-giây)
const MOCK_CAMPAIGNS = [
  { id: 0, owner: "0x1111111111111111111111111111111111111111", title: "Xây trường cho trẻ vùng cao", goal: "5", raised: "2.3", deadline: Date.now() + 7 * 86400000, withdrawn: false },
  { id: 1, owner: "0x2222222222222222222222222222222222222222", title: "Quỹ phẫu thuật tim cho em nhỏ", goal: "10", raised: "10.5", deadline: Date.now() + 2 * 86400000, withdrawn: false },
  { id: 2, owner: "0x3333333333333333333333333333333333333333", title: "Cứu trợ lũ lụt miền Trung", goal: "8", raised: "1.2", deadline: Date.now() - 86400000, withdrawn: false },
];

// Provider chỉ đọc: dùng ví nếu có, nếu không thì dùng RPC công khai Sepolia
function getReadProvider(provider) {
  return provider ?? new JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
}

// Chuyển dữ liệu thô từ contract (BigInt) sang dữ liệu dễ hiển thị
function toCampaign(id, c) {
  return {
    id,
    owner: c.owner,
    title: c.title,
    goal: formatEther(c.goal),           // wei -> ETH
    raised: formatEther(c.amountRaised),
    deadline: Number(c.deadline) * 1000, // giây -> mili-giây
    withdrawn: c.withdrawn,
  };
}

export async function fetchCampaigns(provider) {
  if (USE_MOCK) return MOCK_CAMPAIGNS;

  const contract = new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, getReadProvider(provider));
  const count = Number(await contract.getCampaignCount());
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(toCampaign(i, await contract.getCampaign(i)));
  }
  return list;
}

export async function fetchCampaignById(id, provider) {
  if (USE_MOCK) return MOCK_CAMPAIGNS.find((c) => c.id === Number(id)) ?? null;

  const contract = new Contract(CONTRACT_ADDRESS, CROWDFUNDING_ABI, getReadProvider(provider));
  return toCampaign(Number(id), await contract.getCampaign(id));
}