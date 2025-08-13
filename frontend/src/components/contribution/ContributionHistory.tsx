// components/contribution/ContributionHistory.tsx
import { useEffect, useState } from 'react';
import { getMyContributions, getTotalStats } from '@/services/api';
import { shortenAddress } from '@/utils/walletUtils';

type Contribution = {
  txHash: string;
  amountEth: number;
  tokenAmount: number;
  timestamp: string;
};

export const ContributionHistory = ({ address }: { address: string }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      const fetchContributions = async () => {
        try {
          setLoading(true);
          const data = await getMyContributions(address);
          setContributions(data);
          setError(null);
        } catch (err) {
          console.error("Error fetching contributions:", err);
          setError('Failed to load contribution history');
        } finally {
          setLoading(false);
        }
      };

      fetchContributions();
    }
  }, [address]);

  if (loading) {
    return <div>Loading contribution history...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <section className="bg-white/10 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Your Contributions</h2>
      {contributions.length === 0 ? (
        <p>No contributions yet.</p>
      ) : (
        <div className="space-y-3">
          {contributions.map((contribution) => (
            <div key={contribution.txHash} className="border-b border-gray-700 pb-3 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{contribution.amountEth} ETH</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span>{contribution.tokenAmount} XTK</span>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${contribution.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline text-sm"
                >
                  {shortenAddress(contribution.txHash)}
                </a>
              </div>
              {contribution.timestamp && (
                <div className="text-xs text-gray-500">
                  {new Date(contribution.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};