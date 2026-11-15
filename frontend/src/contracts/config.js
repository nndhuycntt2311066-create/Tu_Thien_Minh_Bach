// NGUỒN DUY NHẤT cho thông tin contract - không lưu địa chỉ ở nơi khác
export const CONTRACT_ADDRESS = ""; // A sẽ gửi địa chỉ sau khi deploy lên Sepolia

export const SEPOLIA_CHAIN_ID = 11155111n;   // "n" = kiểu BigInt (ethers v6 trả về BigInt)
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7"; // cùng số trên, dạng hex

// Tạo link Etherscan để người dùng tự xác minh giao dịch (cốt lõi của tính minh bạch)
export const etherscanTxUrl = (hash) => `https://sepolia.etherscan.io/tx/${hash}`;