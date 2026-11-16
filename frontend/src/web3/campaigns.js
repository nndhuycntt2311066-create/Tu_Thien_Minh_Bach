import { Contract, JsonRpcProvider, ZeroAddress, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "../contracts/config";
import { CROWDFUNDING_ABI } from "../contracts/abi";

// false = đọc dữ liệu thật từ Sepolia
export const USE_MOCK = false;

// Mili-giây -> chuỗi "YYYY-MM-DD" (cùng dạng với mockData.js của C)
const toDateString = (ms) => new Date(ms).toISOString().slice(0, 10);

// Gom dữ liệu về ĐÚNG dạng mà CampaignCard của C đang dùng
function buildCampaign({ id, owner, title, description, imageURI, goal, raised, deadlineMs, withdrawn }) {
  const active = deadlineMs > Date.now() && Number(raised) < Number(goal) && !withdrawn;
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

// Dò xem ID đầu tiên là 0 hay 1 (chờ A xác nhận)
async function getFirstId(contract) {
  try {
    const c = await contract.getCampaign(0);
    if (c.owner !== ZeroAddress) return 0;
  } catch {
    // getCampaign(0) bị revert -> ID bắt đầu từ 1
  }
  return 1;
}

export async function fetchCampaigns(provider) {
  const contract = getContract(provider);
  const count = Number(await contract.getCampaignCount());
  if (count === 0) return [];

  const first = await getFirstId(contract);
  const ids = Array.from({ length: count }, (_, i) => first + i);
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