import { Contract, JsonRpcProvider, formatEther } from "ethers";
import { CONTRACT_ADDRESS } from "../contracts/config";
import { CROWDFUNDING_ABI } from "../contracts/abi";

// true = dùng dữ liệu giả; đổi thành false khi A deploy xong và đã điền CONTRACT_ADDRESS
export const USE_MOCK = true;

// Mili-giây -> chuỗi "YYYY-MM-DD" (cùng dạng với mockData.js của C)
const toDateString = (ms) => new Date(ms).toISOString().slice(0, 10);

// Gom dữ liệu về ĐÚNG dạng mà CampaignCard của C đang dùng
function buildCampaign({ id, owner, title, description = "", goal, raised, deadlineMs, withdrawn = false }) {
  const stillOpen = deadlineMs > Date.now() && Number(raised) < Number(goal) && !withdrawn;
  return {
    id,
    owner,
    title,
    description,                       // contract chưa có trường này -> tạm để rỗng
    target: goal,                      // C dùng tên "target" thay vì "goal" (đơn vị ETH)
    raised,                            // đơn vị ETH
    deadline: toDateString(deadlineMs),// chuỗi ngày, ví dụ "2026-12-31"
    deadlineMs,                        // giữ thêm dạng mili-giây để tính toán khi cần
    active: stillOpen,                 // true = "Đang gây quỹ"
    withdrawn,
  };
}

// Dữ liệu giả
const MOCK_CAMPAIGNS = [
  { id: 1, owner: "0x1111111111111111111111111111111111111111", title: "Xây trường cho trẻ vùng cao", description: "Gây quỹ xây 3 phòng học mới.", goal: "5", raised: "2.3", deadlineMs: Date.now() + 7 * 86400000 },
  { id: 2, owner: "0x2222222222222222222222222222222222222222", title: "Quỹ phẫu thuật tim cho em nhỏ", description: "Hỗ trợ chi phí phẫu thuật.", goal: "10", raised: "10.5", deadlineMs: Date.now() + 2 * 86400000 },
  { id: 3, owner: "0x3333333333333333333333333333333333333333", title: "Cứu trợ lũ lụt miền Trung", description: "Nhu yếu phẩm khẩn cấp.", goal: "8", raised: "1.2", deadlineMs: Date.now() - 86400000 },
].map(buildCampaign);

// Provider chỉ đọc: dùng ví nếu có, nếu không thì dùng RPC công khai Sepolia
function getReadProvider(provider) {
  return provider ?? new JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
}

// Chuyển dữ liệu thô từ contract (BigInt) sang dạng của C
function toCampaign(id, c) {
  return buildCampaign({
    id,
    owner: c.owner,
    title: c.title,
    goal: formatEther(c.goal),            // wei -> ETH
    raised: formatEther(c.amountRaised),
    deadlineMs: Number(c.deadline) * 1000, // giây -> mili-giây
    withdrawn: c.withdrawn,
  });
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