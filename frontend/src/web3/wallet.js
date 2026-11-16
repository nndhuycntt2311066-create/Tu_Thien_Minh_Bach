import { BrowserProvider, formatEther } from "ethers";
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX } from "../contracts/config";

// Kiểm tra đã cài MetaMask chưa (MetaMask chèn window.ethereum vào trình duyệt)
export function hasMetaMask() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

// Yêu cầu MetaMask chuyển sang mạng Sepolia
async function switchToSepolia() {
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
  });
}

// Kết nối ví: hiện popup xin quyền, kiểm tra mạng, trả về thông tin ví
export async function connectWallet() {
  if (!hasMetaMask()) throw new Error("Vui lòng cài đặt MetaMask");

  // Hiện popup MetaMask xin quyền truy cập tài khoản
  await window.ethereum.request({ method: "eth_requestAccounts" });

  let provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== SEPOLIA_CHAIN_ID) {
    await switchToSepolia();
    // Sau khi đổi mạng phải tạo provider MỚI, nếu không ethers v6 báo lỗi "network changed"
    provider = new BrowserProvider(window.ethereum);
  }

  const signer = await provider.getSigner();     // đại diện ví, dùng để ký giao dịch
  const address = await signer.getAddress();
  const balance = formatEther(await provider.getBalance(address)); // wei -> ETH

  return { provider, signer, address, balance };
}