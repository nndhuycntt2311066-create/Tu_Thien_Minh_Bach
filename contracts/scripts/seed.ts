import { network } from "hardhat";

// Địa chỉ contract đã deploy trên Sepolia
const CONTRACT_ADDRESS = "0x61958A66c61566BbEec28feEE3acf933776244f3";

// Kết nối mạng được chọn bằng cờ --network khi chạy lệnh
const { ethers } = await network.connect();
const crowdfunding = await ethers.getContractAt("Crowdfunding", CONTRACT_ADDRESS);

// Số chiến dịch hiện có = id của chiến dịch đầu tiên sẽ tạo trong lần chạy này
const startId = Number(await crowdfunding.getCampaignCount());
console.log("Số chiến dịch hiện có:", startId);

async function create(title: string, desc: string, goalEth: string, days: number) {
  // goal tính bằng wei nên đổi từ ETH bằng parseEther
  const tx = await crowdfunding.createCampaign(
    title,
    desc,
    "https://placehold.co/600x400",
    ethers.parseEther(goalEth),
    days
  );
  await tx.wait(); // chờ giao dịch được đưa vào block
  console.log(`Đã tạo: ${title} | tx: ${tx.hash}`);
}

async function donate(id: number, eth: string) {
  const tx = await crowdfunding.donate(id, { value: ethers.parseEther(eth) });
  await tx.wait();
  console.log(`Đã quyên góp ${eth} ETH vào chiến dịch #${id} | tx: ${tx.hash}`);
}

// 1) Chiến dịch demo HOÀN TIỀN: mục tiêu lớn, hạn 1 ngày (tạo trước vì phải chờ hết hạn)
await create(
  "Chiến dịch demo hoàn tiền",
  "Mục tiêu lớn, hết hạn sau 1 ngày để kiểm thử hoàn tiền.",
  "1",
  1
);

// 2) Chiến dịch demo RÚT TIỀN: mục tiêu nhỏ, sẽ quyên góp đủ ngay
await create(
  "Xây thư viện cho trẻ em vùng cao",
  "Chiến dịch mẫu đạt mục tiêu để demo rút tiền.",
  "0.001",
  30
);

// 3) Chiến dịch ĐANG CHẠY: để giao diện có dữ liệu hiển thị
await create(
  "Quỹ học bổng sinh viên khó khăn",
  "Chiến dịch mẫu đang gây quỹ.",
  "1",
  30
);

// Quyên góp mẫu (id tính từ startId nên luôn đúng dù trước đó đã có chiến dịch khác)
await donate(startId, "0.002");      // hoàn tiền: không đạt mục tiêu 1 ETH
await donate(startId + 1, "0.001");  // rút tiền: đủ mục tiêu 0.001 ETH
await donate(startId + 2, "0.0005"); // đang chạy

// In tóm tắt để ghi lại
console.log("\n===== TÓM TẮT =====");
for (let id = startId; id < startId + 3; id++) {
  const c = await crowdfunding.getCampaign(id);
  console.log(
    `#${id} | ${c.title} | đã gom ${ethers.formatEther(c.amountRaised)}/${ethers.formatEther(c.goal)} ETH | hết hạn: ${new Date(Number(c.deadline) * 1000).toLocaleString("vi-VN")}`
  );
}
console.log("Xem trên Etherscan: https://sepolia.etherscan.io/address/" + CONTRACT_ADDRESS);