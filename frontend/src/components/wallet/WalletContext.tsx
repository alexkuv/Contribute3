import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import type { ConnectedWallet, WalletProvider as WalletProviderType, WalletType, TokenBalance } from '@/types/wallet';
import { saveContribution } from '@/services/api';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const DONATION_WALLET_ADDRESS = import.meta.env.VITE_DONATION_WALLET_ADDRESS || '0x7D0b9B10CebDb3996005239Fd8216A9fcAA8787C';

const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

type WalletContextType = {
  wallet: ConnectedWallet | null;
  isConnected: boolean;
  connecting: boolean;
  connectWallet: (providerId: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  sendContribution: (amount: string, network: WalletType) => Promise<string | null>;
  getTokenBalances: () => Promise<TokenBalance[]>;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WALLET_PROVIDERS: WalletProviderType[] = [
  {
    id: 'ethereum',
    name: 'Ethereum (MetaMask)',
    connect: async () => {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not found. Please install MetaMask.');
      }
      
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        if (!isValidEthereumAddress(address)) {
          throw new Error('Invalid wallet address received');
        }
        
        const balanceWei = await provider.getBalance(address);
        const balance = ethers.formatEther(balanceWei);
        
        if (parseFloat(balance) < 0) {
          throw new Error('Invalid balance received');
        }
        
        return { address, balance };
      } catch (error: any) {
        if (error.code === 4001) {
          throw new Error('User rejected connection');
        }
        throw new Error(`Connection failed: ${error.message || 'Unknown error'}`);
      }
    },
    getBalance: async (address: string) => {
      if (!isValidEthereumAddress(address)) {
        throw new Error('Invalid address provided');
      }
      if (typeof window.ethereum === 'undefined') return '0';
      
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balanceWei = await provider.getBalance(address);
        return ethers.formatEther(balanceWei);
      } catch (error) {
        console.error('Error fetching balance:', error);
        return '0';
      }
    },
  },
];

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const savedWallet = localStorage.getItem('wallet');
    const savedIsConnected = localStorage.getItem('isConnected');
    
    if (savedWallet && savedIsConnected === 'true') {
      try {
        const parsedWallet = JSON.parse(savedWallet);
        if (isValidEthereumAddress(parsedWallet.address)) {
          setWallet(parsedWallet);
          setIsConnected(true);
        } else {
          localStorage.removeItem('wallet');
          localStorage.setItem('isConnected', 'false');
        }
      } catch (error) {
        localStorage.removeItem('wallet');
        localStorage.setItem('isConnected', 'false');
      }
    }
  }, []);

  const connectWallet = async (providerId: WalletType) => {
    if (connecting) return;
    
    setConnecting(true);
    try {
      const provider = WALLET_PROVIDERS.find(p => p.id === providerId);
      if (!provider) throw new Error(`Provider ${providerId} not found.`);
      
      const walletData = await provider.connect();
      const newWallet = { ...walletData, provider: providerId };
      
      setWallet(newWallet);
      setIsConnected(true);
      localStorage.setItem('wallet', JSON.stringify(newWallet));
      localStorage.setItem('isConnected', 'true');
    } catch (err: any) {
      setIsConnected(false);
      setWallet(null);
      localStorage.removeItem('wallet');
      localStorage.setItem('isConnected', 'false');
      throw err;
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setIsConnected(false);
    localStorage.removeItem('wallet');
    localStorage.setItem('isConnected', 'false');
  };

  const refreshBalance = async () => {
    if (!wallet) return;
    
    try {
      const provider = WALLET_PROVIDERS.find(p => p.id === wallet.provider);
      if (provider) {
        const newBalance = await provider.getBalance(wallet.address);
        setWallet(prev => prev ? { ...prev, balance: newBalance } : null);
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  const sendContribution = async (
    amount: string,
    network: WalletType
  ): Promise<string | null> => {
    if (!wallet || wallet.provider !== network) {
      throw new Error(`Please connect to the ${network} network.`);
    }
    
    if (!isValidEthereumAddress(wallet.address)) {
      throw new Error('Invalid wallet address');
    }
    
    if (!isValidEthereumAddress(DONATION_WALLET_ADDRESS)) {
      throw new Error('Invalid donation wallet address');
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error('Invalid amount');
    }
    
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not found');
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const balanceWei = await provider.getBalance(wallet.address);
      const userBalance = ethers.formatEther(balanceWei);
      
      if (parseFloat(userBalance) < amountNum) {
        throw new Error(`Insufficient balance. You have ${userBalance} ETH, trying to send ${amountNum} ETH`);
      }
      
      const tx = await signer.sendTransaction({
        to: DONATION_WALLET_ADDRESS,
        value: ethers.parseEther(amount),
      });
      
      const receipt = await tx.wait();
      
      if (!receipt || receipt.status !== 1) {
        throw new Error('Transaction failed on blockchain');
      }
      
      const txHash = tx.hash;
      const amountEth = amountNum;
      const tokenAmount = amountNum * 1000;
      
      await saveContribution({
        from: wallet.address,
        txHash,
        network,
        amountEth,
        tokenAmount,
      });
      
      return txHash;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected transaction');
      }
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for transaction');
      }
      throw new Error(`Transaction failed: ${error.message || 'Unknown error'}`);
    }
  };

  const getTokenBalances = async (): Promise<TokenBalance[]> => {
    if (!wallet || wallet.provider !== 'ethereum') return [];
    if (typeof window.ethereum === 'undefined') return [];
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await provider.getBalance(wallet.address);
      const ethBalance = ethers.formatEther(balanceWei);
      
      return [{
        name: 'SepoliaETH',
        symbol: 'SEP',
        balance: ethBalance,
        address: '0x0000000000000000000000000000000000000000',
        type: 'NATIVE',
      }];
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
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
        sendContribution,
        getTokenBalances,
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
