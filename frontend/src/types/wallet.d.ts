export type WalletType = 'ethereum' | 'solana';

export interface WalletProvider {
  id: WalletType;
  name: string;
  connect: () => Promise<{ address: string; balance: string }>;
  getBalance: (address: string) => Promise<string>;
}

export interface ConnectedWallet {
  provider: WalletType;
  address: string;
  balance: string;
}