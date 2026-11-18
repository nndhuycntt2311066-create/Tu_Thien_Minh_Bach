# Hướng dẫn dùng Web3 hooks

Thư mục này chứa toàn bộ phần kết nối blockchain (Sepolia) cho giao diện. Giao diện **chỉ cần dùng các hook** dưới đây, không cần gọi ethers trực tiếp.

## Thông tin contract (nguồn duy nhất: `src/contracts/config.js`)

- Mạng: Sepolia (chainId 11155111)
- Địa chỉ contract: `0x61958A66c61566BbEec28feEE3acf933776244f3`
- Xem công khai trên Etherscan: https://sepolia.etherscan.io/address/0x61958A66c61566BbEec28feEE3acf933776244f3
- Số tiền trong hook luôn tính bằng **ETH (chuỗi)**, hook tự đổi sang/từ wei.

## 1. useWallet

Kết nối MetaMask, tự yêu cầu chuyển sang Sepolia, tự cập nhật khi đổi tài khoản hoặc đổi mạng.

```jsx
import { useWallet } from "./web3/hooks/useWallet";

const { address, balance, signer, provider, isConnected, isConnecting, error, connect, disconnect } = useWallet();
```

| Giá trị | Ý nghĩa |
|---|---|
| `address` | Địa chỉ ví (null nếu chưa kết nối) |
| `balance` | Số dư ETH (chuỗi) |
| `signer` | Truyền vào `useDonate`, `useWithdraw`... để ký giao dịch |
| `isConnected`, `isConnecting` | Trạng thái kết nối |
| `error` | Thông báo lỗi tiếng Việt |
| `connect()`, `disconnect()` | Kết nối / ngắt kết nối (chỉ xóa trạng thái trong app) |

## 2. useCampaigns

Đọc danh sách chiến dịch từ blockchain (không cần ví).

```jsx
const { campaigns, isLoading, error, reload } = useCampaigns();
```

Mỗi chiến dịch: `id, owner, title, description, imageURI, target, raised, deadline ("YYYY-MM-DD"), deadlineMs, active, withdrawn`. `target` và `raised` tính bằng ETH.

## 3. useDonate / useWithdraw / useRefund / useCreateCampaign

Cả bốn hook cùng một kiểu, nhận `signer` từ `useWallet()`:

```jsx
const { donate, state, hash, explorerUrl, message, isBusy, reset } = useDonate(signer);
donate(campaignId, "0.01");          // quyên góp 0.01 ETH

const { withdraw } = useWithdraw(signer);   // chủ chiến dịch rút tiền
withdraw(campaignId);

const { refund } = useRefund(signer);       // người góp xin hoàn tiền
refund(campaignId);

const { createCampaign } = useCreateCampaign(signer);
createCampaign({ title, description, imageURI, goalEth: "5", days: 30 });
```

Trạng thái `state`:

| state | Ý nghĩa | Gợi ý hiển thị |
|---|---|---|
| `idle` | Chưa làm gì | Bình thường |
| `confirming` | Chờ người dùng bấm Confirm trong MetaMask | "Vui lòng xác nhận trong ví" |
| `pending` | Đã gửi, chờ đưa vào block | Spinner + link Etherscan |
| `success` | Thành công | Thông báo thành công, gọi `reload()` danh sách |
| `rejected` | Người dùng bấm Reject | "Bạn đã hủy giao dịch" |
| `error` | Thất bại | Hiện `message` (tiếng Việt) |

- `hash`: mã giao dịch. `explorerUrl`: link Etherscan để người dùng tự xác minh (luôn nên hiển thị).
- `isBusy`: `true` khi đang confirming/pending, dùng để khóa nút bấm.

## 4. useDonations

Lịch sử quyên góp của một chiến dịch, đọc từ event `DonationReceived`, tự cập nhật khi có người góp mới.

```jsx
const { donations, isLoading, error, reload } = useDonations(campaignId);
// mỗi phần tử: { donor, amount (ETH), txHash, blockNumber }, mới nhất đứng đầu
```

## Ví dụ gắn vào trang danh sách

```jsx
function Campaigns() {
  const { campaigns, isLoading, error } = useCampaigns();
  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>{error}</p>;
  return campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />);
}
```

## Lưu ý

- Không lưu hay yêu cầu private key; mọi giao dịch do người dùng tự ký qua MetaMask.
- Địa chỉ contract và ABI chỉ sửa ở `src/contracts/`, không chép sang nơi khác.
- Chỉnh thông báo lỗi tiếng Việt ở `errors.js`.