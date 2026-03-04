export const WYDA_TOKEN_ADDRESS = "0xD84B7E8b295d9Fa9656527AC33Bf4F683aE7d2C4";
// This would be the deployed contract address. For now, we'll use a placeholder.
export const ESCROW_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; 

export const WYDA_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)"
];

export const ESCROW_ABI = [
  "function createListing(uint256 _price, uint256 _minPrice, uint8 _pricingType, string memory _metadataUri) external",
  "function buyItem(uint256 _id) external",
  "function confirmReceipt(uint256 _id) external",
  "function refundBuyer(uint256 _id) external",
  "function listings(uint256) view returns (uint256 id, address seller, address buyer, uint256 price, uint256 minPrice, uint8 status, uint8 pricingType, string metadataUri)",
  "function listingCount() view returns (uint256)",
  "event ListingCreated(uint256 indexed id, address indexed seller, uint256 price, uint256 minPrice, uint8 pricingType, string metadataUri)",
  "event ListingLocked(uint256 indexed id, address indexed buyer)",
  "event ListingCompleted(uint256 indexed id)",
  "event ListingRefunded(uint256 indexed id)"
];
