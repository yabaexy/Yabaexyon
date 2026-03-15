export interface Item {
  id: number;
  onChainId: number;
  title: string;
  description: string;
  price: string;
  minPrice?: string;
  pricingType: 'Fixed' | 'Auction';
  imageUrl: string;
  sellerAddress: string;
  category: string;
  condition: string;
  createdAt: string;
}

export interface User {
  address: string;
  username: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

export enum EscrowStatus {
  Open = 0,
  Locked = 1,
  Completed = 2,
  Refunded = 3,
  Disputed = 4
}
