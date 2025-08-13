// pages/index.tsx
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { ethers } from 'ethers'; 
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContributionForm from '@/components/contribution/ContributionForm';
import { ContributionHistory } from '@/components/contribution/ContributionHistory';
import type { WalletProvider, ConnectedWallet, WalletType } from '@/types/wallet';
import { sendContribution } from '@/hooks/UseEtherium'; // Импортируем реальную функцию отправки
import { getTotalStats } from '@/services/api';

// Иконки (оставляем как есть)
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
    name: 'Ethereum (MetaMask)',
    icon: EthereumIcon,
    connect: async () => {
      // Реальная логика подключения к Ethereum
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      try {
        // Запрашиваем доступ к аккаунту
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Получаем провайдер и signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Получаем баланс
        const balanceWei = await provider.getBalance(address);
        const balance = ethers.formatEther(balanceWei);

        return {
          address,
          balance,
        };
      } catch (error: any) {
        console.error("Ethereum connection error:", error);
        throw new Error(error.message || 'Failed to connect to Ethereum wallet.');
      }
    },
    getBalance: async (address: string) => {
      if (typeof window.ethereum === 'undefined') {
        return '0';
      }
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(address);
        return ethers.formatEther(balanceWei);
      } catch (error) {
        console.error("Error fetching Ethereum balance:", error);
        return '0';
      }
    },
  },
  {
    id: 'solana',
    name: 'Solana (Phantom)',
    icon: SolanaIcon,
    connect: async () => {
      // TODO: Реализовать реальное подключение к Solana
      // Пока оставляем фейковые данные
      return {
        address: 'SoLaNaFakeAddress123456789',
        balance: '0.00',
      };
    },
    getBalance: async () => {
      // TODO: Реализовать реальное получение баланса для Solana
      return '0.00';
    },
  },
];

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [totalStats, setTotalStats] = useState({ totalEth: 0, totalTokens: 0 });

  // Загружаем общую статистику при монтировании
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

  const handleConnect = async (providerId: WalletType) => {
    try {
      const provider = WALLET_PROVIDERS.find(p => p.id === providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found.`);
      }

      // Вызываем реальную функцию подключения
      const walletData = await provider.connect();
      
      setWallet({
        provider: providerId,
        address: walletData.address,
        balance: walletData.balance,
      });
      setConnected(true);
      
      toast.success(`Connected: ${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}`);
    } catch (error: any) {
      console.error("Connection failed:", error);
      toast.error(error.message || 'Failed to connect wallet.');
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setWallet(null);
    toast.info('Wallet disconnected');
  };

  const handleContribute = async (network: 'ethereum' | 'solana', amount: string) => {
    if (!wallet) {
      toast.error('Please connect your wallet first.');
      return;
    }

    if (network === 'ethereum') {
      try {
        // Используем реальную функцию отправки для Ethereum
        const txHash = await sendContribution(amount, wallet.address, network);
        
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

        // Обновляем статистику после успешного вклада
        try {
          const stats = await getTotalStats();
          setTotalStats(stats);
        } catch (error) {
          console.error("Error updating stats:", error);
        }
      } catch (error: any) {
        console.error("Contribution error:", error);
        toast.error(error.message || 'Failed to send contribution.');
      }
    } else {
      // Для Solana пока показываем сообщение
      toast.info('Solana contributions are not yet implemented.');
    }
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
        {wallet && <ContributionHistory address={wallet.address} />}
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
}