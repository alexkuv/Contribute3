import type { ConnectedWallet } from '../types/wallet';

export const shortenAddress = (addr: string): string =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

export const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

// Заглушки для балансов
export const getFakeAddress = (provider: string): string => {
  if (provider === 'ethereum') {
    return '0xAbC1234567890123456789012345678901234567';
  }
  if (provider === 'solana') {
    return 'GkY1234567890123456789012345678901234567890';
  }
  return '';
};

export const getFakeBalance = (provider: string): string => {
  return provider === 'ethereum' ? '2.45' : '15.7';
};