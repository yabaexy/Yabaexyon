export interface Item {
  id: number;
  onChainId: number;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  sellerAddress: string;
  category: string;
  createdAt: string;
}

export enum EscrowStatus {
  Open = 0,
  Locked = 1,
  Completed = 2,
  Refunded = 3,
  Disputed = 4
}
