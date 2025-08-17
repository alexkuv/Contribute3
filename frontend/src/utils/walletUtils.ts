export const shortenAddress = (addr: string): string =>
  addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

export const formatBalance = (balance: string): string => {
  const num = parseFloat(balance);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};