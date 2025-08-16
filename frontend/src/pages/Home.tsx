import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContributionForm from '@/components/contribution/ContributionForm';
import { ContributionHistory } from '@/components/contribution/ContributionHistory';
import { WalletProvider, useWallet, WALLET_PROVIDERS } from '@/components/wallet/WalletContext';
import type { WalletType } from '@/types/wallet';
import { getTotalStats } from '@/services/api';

const HomeContent = () => {
  const { wallet, isConnected, connectWallet, disconnectWallet, sendContribution, getTokenBalances } = useWallet();
  const [totalStats, setTotalStats] = useState({ totalEth: 0, totalTokens: 0 });
  const [tokenBalances, setTokenBalances] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [contribHistoryKey, setContribHistoryKey] = useState(0);

  useEffect(() => {
    const fetchTotalStats = async () => {
      try {
        const stats = await getTotalStats();
        setTotalStats(stats);
      } catch (error) {
        console.error("Error fetching total stats:", error);
      }
    };
    fetchTotalStats();
  }, []);

  useEffect(() => {
    const fetchTokenBalances = async () => {
      if (isConnected && wallet && wallet.provider === 'ethereum') {
        setLoadingTokens(true);
        try {
          const balances = await getTokenBalances();
          setTokenBalances(balances);
        } catch (error) {
          console.error('Error fetching token balances:', error);
          toast.error('Failed to load token balances.');
        } finally {
          setLoadingTokens(false);
        }
      } else {
        setTokenBalances([]);
      }
    };
    fetchTokenBalances();
  }, [isConnected, wallet, getTokenBalances]);

  const handleConnect = async (providerId: WalletType) => {
    try {
      await connectWallet(providerId);
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      console.error("Connection failed:", error);
      toast.error(error.message || 'Failed to connect wallet.');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.info('Wallet disconnected');
  };

  const handleContribute = async (network: 'ethereum', amount: string) => {
    if (!isConnected || !wallet) {
      toast.error('Please connect your wallet first.');
      return;
    }
    try {
      const txHash = await sendContribution(amount, network);
      if (txHash) {
        toast.success(
          <div>
            Contribution sent successfully!
            <br />
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 underline text-sm"
            >
              View on Etherscan
            </a>
          </div>
        );
        try {
          const stats = await getTotalStats();
          setTotalStats(stats);
        } catch (error) {
          console.error("Error updating stats:", error);
        }
        setLoadingTokens(true);
        try {
          const balances = await getTokenBalances();
          setTokenBalances(balances);
        } catch (error) {
          console.error('Error refreshing token balances:', error);
        } finally {
          setLoadingTokens(false);
        }
        setContribHistoryKey(prev => prev + 1);
      }
    } catch (error: any) {
      console.error("Contribution error (caught in Home):", error);
      toast.error(error.message || 'Failed to send contribution');
    }
  };

  return (
    <>
      <Header
        connected={isConnected}
        wallet={wallet}
        providers={WALLET_PROVIDERS}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      <main className="max-w-5xl mx-auto p-6 pt-10 space-y-8">
        <ContributionForm connected={isConnected} onSubmit={handleContribute} />
        {isConnected && wallet && <ContributionHistory key={contribHistoryKey} address={wallet.address} />}
        {isConnected && wallet && wallet.provider === 'ethereum' && (
          <section className="bg-white/10 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Your Tokens (Sepolia)</h2>
            {loadingTokens ? (
              <p>Loading tokens...</p>
            ) : tokenBalances.length === 0 ? (
              <p>No tokens found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokenBalances.map((token, index) => (
                  <div key={index} className="bg-black/20 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold">{token.symbol}</h3>
                        <p className="text-sm text-gray-300">{token.name}</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-blue-500">
                        Native
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-right">{parseFloat(token.balance).toFixed(4)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        <section className="bg-white/10 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-2">Total Contributions</h2>
          <p><strong>ETH:</strong> {totalStats.totalEth.toFixed(4)} ETH</p>
          <p><strong>XTK Tokens:</strong> {totalStats.totalTokens.toFixed(0)} XTK</p>
          <p className="text-sm text-gray-300 mt-1">Includes all successful on-chain transfers</p>
        </section>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default function Home() {
  return (
    <WalletProvider>
      <HomeContent />
    </WalletProvider>
  );
}