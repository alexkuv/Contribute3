// contexts/WalletContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import type { ConnectedWallet, WalletProvider as WalletProviderType, WalletType } from '@/types/wallet';
import { getFakeAddress, getFakeBalance } from '@/utils/walletUtils';
import { saveContribution } from '@/services/api'; // Импортируем API

// Определяем типы для контекста
type WalletContextType = {
  wallet: ConnectedWallet | null;
  isConnected: boolean;
  connecting: boolean;
  connectWallet: (providerId: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  sendContribution: (amount: string, network: WalletType) => Promise<string | null>; // Добавляем функцию отправки
};

// Инициализация контекста
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Адрес получателя (замените на ваш реальный адрес)
const RECIPIENT_ADDRESS = import.meta.env.VITE_RECIPIENT_ADDRESS || '0x123...YOUR_ADDRESS_HERE...';

// Курс конвертации (1 ETH = 1000 XTK)
const CONVERSION_RATE = 1000;

// Провайдеры кошельков
export const WALLET_PROVIDERS: WalletProviderType[] = [
  {
    id: 'ethereum',
    name: 'Ethereum (MetaMask)',
    // icon: EthereumIcon, // Импортируйте иконку отдельно
    connect: async () => {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }

      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
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
      if (typeof window.ethereum === 'undefined') return '0';
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
    // icon: SolanaIcon, // Импортируйте иконку отдельно
    connect: async () => {
      // TODO: Реализовать подключение к Solana (Phantom и т.д.)
      // Пока используем фейковые данные
      const fakeAddress = getFakeAddress('solana');
      return {
        address: fakeAddress,
        balance: getFakeBalance('solana'),
      };
    },
    getBalance: async (address: string) => {
      // TODO: Реализовать получение баланса для Solana
      return getFakeBalance('solana'); // Пока заглушка
    },
  },
];

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum?.selectedAddress) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balanceWei = await provider.getBalance(address);
          const balance = ethers.formatEther(balanceWei);

          setWallet({ provider: 'ethereum', address, balance });
          setIsConnected(true);
        } catch (err) {
          console.error("Error restoring Ethereum session:", err);
        }
      }
    };

    checkConnection();
  }, []);

  const connectWallet = async (providerId: WalletType) => {
    setConnecting(true);
    try {
      const provider = WALLET_PROVIDERS.find(p => p.id === providerId);
      if (!provider) {
        throw new Error(`Provider ${providerId} not found.`);
      }

      const walletData = await provider.connect();
      setWallet({ ...walletData, provider: providerId });
      setIsConnected(true);
    } catch (err: any) {
      console.error("Connection failed:", err);
      alert(err.message || 'Failed to connect wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsConnected(false);
  };

  const refreshBalance = async () => {
    if (!wallet) return;
    try {
      const provider = WALLET_PROVIDERS.find(p => p.id === wallet.provider);
      if (provider) {
        const newBalance = await provider.getBalance(wallet.address);
        setWallet(prev => prev ? { ...prev, balance: newBalance } : null);
      }
    } catch (err) {
      console.error("Error refreshing balance:", err);
    }
  };

  const sendContribution = async (amount: string, network: WalletType): Promise<string | null> => {
    if (!wallet || wallet.provider !== network) {
      alert(`Please connect to the ${network} network.`);
      return null;
    }

    if (network === 'ethereum') {
      if (typeof window.ethereum === 'undefined') {
        alert('MetaMask not found. Please install MetaMask.');
        return null;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Отправка транзакции
        const tx = await signer.sendTransaction({
          to: RECIPIENT_ADDRESS,
          value: ethers.parseEther(amount),
        });

        // Ожидание подтверждения
        const receipt = await tx.wait();
        if (receipt.status !== 1) {
          throw new Error('Transaction failed on the blockchain.');
        }

        // Сохранение вклада в бэкенд
        const contributionData = {
          from: wallet.address,
          txHash: tx.hash,
          network,
          amountEth: parseFloat(amount),
          tokenAmount: parseFloat(amount) * CONVERSION_RATE,
        };
        await saveContribution(contributionData);

        return tx.hash; // Возвращаем хэш транзакции
      } catch (error: any) {
        console.error("Contribution error:", error);
        alert(`Error sending contribution: ${error.message || error.reason || 'Unknown error'}`);
        return null;
      }
    } else if (network === 'solana') {
      // TODO: Реализовать отправку для Solana
      alert('Solana contribution is not yet implemented.');
      return null;
    }

    return null;
  };


  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnected,
        connecting,
        connectWallet,
        disconnectWallet,
        refreshBalance,
        sendContribution, // Экспортируем новую функцию
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
