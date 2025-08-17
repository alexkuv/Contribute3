export type WalletType = 'ethereum';

export interface WalletProvider {
  id: WalletType;
  name: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  connect: () => Promise<{ address: string; balance: string }>;
  getBalance: (address: string) => Promise<string>;
}

export interface ConnectedWallet {
  provider: WalletType;
  address: string;
  balance: string;
}

export interface TokenBalance {
  name: string;
  symbol: string;
  balance: string;
  address: string;
  type: 'NATIVE';
}