import { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import Button from '../ui/Button';

type Network = 'ethereum' | 'solana';

type Props = {
  connected: boolean;
  onSubmit: (network: Network, amount: string) => void;
};

export default function ContributionForm({ connected, onSubmit }: Props) {
  const [network, setNetwork] = useState<Network>('ethereum');
  const [amount, setAmount] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      onSubmit(network, amount);
      setAmount('');
      setIsSending(false);
    }, 2000);
  };

  return (
    <section className="bg-white/10 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Make a Contribution</h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Network</label>
          <div className="flex gap-2">
            <button
              onClick={() => setNetwork('ethereum')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                network === 'ethereum'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => setNetwork('solana')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                network === 'solana'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Solana
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount ({network === 'ethereum' ? 'ETH' : 'SOL'})
          </label>
          <input
            id="amount"
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.05"
            disabled={!connected}
            className="w-full px-4 py-2 bg-white/10 border border-purple-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            'Send Contribution'
          )}
        </Button>
      </div>
    </section>
  );
}