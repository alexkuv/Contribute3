// components/contribution/ContributionForm.tsx
import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { useWallet } from '@/components/wallet/WalletContext';
import type { TokenBalance } from '@/types/wallet';

type Network = 'ethereum' | 'solana';

type Props = {
  connected: boolean;
  onSubmit: (network: Network, amount: string, tokenType: 'ETH' | 'LINK') => void;
};

export default function ContributionForm({ connected, onSubmit }: Props) {
  const { wallet, getTokenBalances } = useWallet();
  const [network, setNetwork] = useState<Network>('ethereum');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [tokenType, setTokenType] = useState<'ETH' | 'LINK'>('ETH');
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (connected && wallet && wallet.provider === 'ethereum') {
        setLoadingTokens(true);
        try {
          const balances = await getTokenBalances();
          setTokenBalances(balances);
        } catch (error) {
          console.error('Error fetching token balances:', error);
        } finally {
          setLoadingTokens(false);
        }
      } else {
        setTokenBalances([]);
      }
    };

    fetchTokenBalances();
  }, [connected, wallet, getTokenBalances]);


  useEffect(() => {
    if (network !== 'ethereum') {
      setTokenType('ETH');
    }
  }, [network]);

  const handleSubmit = () => {
    if (!connected) {
      alert('Please connect your wallet first.');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setIsSending(true);

    onSubmit(network, amount, tokenType);
    setAmount('');
    setIsSending(false);
  };

  const getRelevantTokens = () => {
    if (network === 'ethereum') {
      return tokenBalances.filter(token => 
        token.type === 'NATIVE' || token.type === 'ERC20'
      );
    }

    return [];
  };

  const relevantTokens = getRelevantTokens();

  return (
    <section className="bg-white/10 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Make a Contribution</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Network</label>
          <div className="flex gap-2">
            <button
              onClick={() => setNetwork('ethereum')}
              disabled={!connected}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                network === 'ethereum'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 disabled:opacity-50'
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => setNetwork('solana')}
              disabled={!connected}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                network === 'solana'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 disabled:opacity-50'
              }`}
            >
              Solana
            </button>
          </div>
        </div>

        {connected && network === 'ethereum' && (
          <div>
            <label className="block text-sm font-medium mb-2">Token</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTokenType('ETH')}
                disabled={!connected}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  tokenType === 'ETH'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 disabled:opacity-50'
                }`}
              >
                ETH
              </button>
              <button
                onClick={() => setTokenType('LINK')}
                disabled={!connected || relevantTokens.every(t => t.symbol !== 'LINK' || parseFloat(t.balance) === 0)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  tokenType === 'LINK'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 disabled:opacity-50'
                }`}
              >
                LINK
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-400">
              {loadingTokens ? (
                <span>Loading balances...</span>
              ) : (
                relevantTokens.map(token => (
                  <div key={token.symbol}>
                    Balance: {token.symbol} {parseFloat(token.balance).toFixed(4)}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount ({tokenType})
          </label>
          <input
            id="amount"
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.05"
            disabled={!connected}
            className="w-full px-4 py-2 bg-white/10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={!connected || isSending || !amount}
          className="w-full flex items-center justify-center gap-2"
          variant="success"
        >
          {isSending ? (
            <>
              <LoadingSpinner />
              Sending...
            </>
          ) : (
            `Send Contribution (${tokenType})`
          )}
        </Button>
      </div>
    </section>
  );
}