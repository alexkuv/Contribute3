import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContributionForm from '@/components/contribution/ContributionForm';
import ContributionHistory from '@/components/contribution/ContributionHistory';


import type { WalletProvider, ConnectedWallet } from '../types/wallet';
import { getFakeAddress, getFakeBalance } from '../utils/walletUtils';

const EthereumIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
  </svg>
);

const SolanaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 22c-5.514 0-10-4.486-10-10s4.486-10 10-10 10 4.486 10 10-4.486 10-10 10zm-5-5h10v-2h-10v2zm0-4h10v-2h-10v2zm0-4h10v-2h-10v2z" />
  </svg>
);


const WALLET_PROVIDERS: WalletProvider[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    icon: EthereumIcon,
    connect: async () => ({
      address: getFakeAddress('ethereum'),
      balance: getFakeBalance('ethereum'),
    }),
    getBalance: async () => getFakeBalance('ethereum'),
  },
  {
    id: 'solana',
    name: 'Solana',
    icon: SolanaIcon,
    connect: async () => ({
      address: getFakeAddress('solana'),
      balance: getFakeBalance('solana'),
    }),
    getBalance: async () => getFakeBalance('solana'),
  },
];

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);

  const handleConnect = (data: { provider: string; address: string; balance: string }) => {
    setWallet(data as ConnectedWallet);
    setConnected(true);
    toast.success(`Connected: ${data.address.slice(0, 6)}...${data.address.slice(-4)}`);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setWallet(null);
    toast.info('Wallet disconnected');
  };

  const handleContribute = (network: 'ethereum' | 'solana', amount: string) => {
    const txHash = '0x' + 'a'.repeat(64);
    toast.success(
      <div>
        Contribution sent!
        <br />
        <a
          href={`https://etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-400 underline text-sm"
        >
          View on Etherscan
        </a>
      </div>
    );
  };

  return (
    <>
      <Header
        connected={connected}
        wallet={wallet}
        providers={WALLET_PROVIDERS}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <main className="max-w-5xl mx-auto p-6 pt-10 space-y-8">
        <ContributionForm connected={connected} onSubmit={handleContribute} />
        <ContributionHistory />
        <section className="bg-white/10 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Total Contributions</h2>
          <p><strong>ETH:</strong> 0.00 ETH</p>
          <p className="text-sm text-gray-300 mt-1">Includes all successful on-chain transfers</p>
        </section>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={1000} />
    </>
  );
}