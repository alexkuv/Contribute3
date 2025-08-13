const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const saveContribution = async (data: {
  from: string;
  txHash: string;
  network: 'ethereum' | 'solana';
  amountEth: number;
  tokenAmount: number;
}) => {
  const res = await fetch(`${API_URL}/contributions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to save contribution');
  }

  return res.json();
};

export const getMyContributions = async (address: string) => {
  const res = await fetch(`${API_URL}/contributions/me?address=${address}`);
  console.log(res)
  return res.json();
};

export const getTotalStats = async () => {
  const res = await fetch(`${API_URL}/contributions/total`);
  return res.json();
};