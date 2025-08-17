export type ContributionDto = {
  from: string;
  txHash: string;
  network: 'ethereum' | 'solana';
  amountEth: number;
  tokenAmount?: number;
  timestamp: string;
};