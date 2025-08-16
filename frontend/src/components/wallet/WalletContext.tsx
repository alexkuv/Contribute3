import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import type { ConnectedWallet, WalletProvider as WalletProviderType, WalletType, TokenBalance } from '@/types/wallet';
import { getFakeAddress, getFakeBalance } from '@/utils/walletUtils';
import { saveContribution } from '@/services/api';

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// ABI для transfer функции ERC-20
const ERC20_TRANSFER_ABI = ["function transfer(address to, uint256 amount)"];

type WalletContextType = {
  wallet: ConnectedWallet | null;
  isConnected: boolean;
  connecting: boolean;
  connectWallet: (providerId: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  sendContribution: (amount: string, network: WalletType, tokenType: 'ETH' | 'LINK') => Promise<string | null>; // Обновлено
  getTokenBalances: () => Promise<TokenBalance[]>;
};


const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Адрес получателя
const RECIPIENT_ADDRESS = '0x9B87Be4a795BCa96eFC23bf8a0911a2e993983E6';

const CONVERSION_RATE = 1000;

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
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa36a7') { // Sepolia chainId (11155111)
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xaa36a7' }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  rpcUrls: ['https://rpc.sepolia.org'],
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'SEP',
                    decimals: 18
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
              });
            } else {
              throw switchError;
            }
          }
        }

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
    connect: async () => {
      const fakeAddress = getFakeAddress('solana');
      return {
        address: fakeAddress,
        balance: getFakeBalance('solana'),
      };
    },
    getBalance: async (address: string) => {
      return getFakeBalance('solana');
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
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== '0xaa36a7') {
            return;
          }

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

  const sendContribution = async (
    amount: string, 
    network: WalletType, 
    tokenType: 'ETH' | 'LINK'
  ): Promise<string | null> => {
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

        let tx;
        if (tokenType === 'ETH') {
          tx = await signer.sendTransaction({
            to: RECIPIENT_ADDRESS,
            value: ethers.parseEther(amount),
          });
        } else if (tokenType === 'LINK') {
          const linkTokenAddress = '0x779877a7b0d9e8603169ddbd7836e478b4624789'; // Адрес Sepolia LINK
          const linkContract = new ethers.Contract(linkTokenAddress, ERC20_TRANSFER_ABI, signer);
          const amountInWei = ethers.parseUnits(amount, 18);
          
          tx = await linkContract.transfer(RECIPIENT_ADDRESS, amountInWei);
        } else {
           throw new Error(`Unsupported token type: ${tokenType}`);
        }

        const receipt = await tx.wait();
        if (receipt.status !== 1) {
          throw new Error('Transaction failed on the blockchain.');
        }

        const contributionData = {
          from: wallet.address,
          txHash: tx.hash,
          network,
          amountEth: tokenType === 'ETH' ? parseFloat(amount) : 0,
          tokenAmount: parseFloat(amount) * (tokenType === 'ETH' ? CONVERSION_RATE : 1),
          tokenType
        };
        await saveContribution(contributionData);

        return tx.hash;
      } catch (error: any) {
        console.error("Contribution error:", error);
        alert(`Error sending contribution: ${error.message || error.reason || 'Unknown error'}`);
        return null;
      }
    } else if (network === 'solana') {
      alert('Solana contribution is not yet implemented.');
      return null;
    }

    return null;
  };

  const getTokenBalance = async (tokenAddress: string, userAddress: string): Promise<TokenBalance> => {
    if (typeof window.ethereum === 'undefined') {
      return {
        name: 'Unknown',
        symbol: 'UNK',
        balance: '0',
        address: tokenAddress,
        type: 'ERC20'
      };
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      
      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(userAddress),
        contract.decimals(),
        contract.symbol()
      ]);

      return {
        name: `${symbol} Token`,
        symbol,
        balance: ethers.formatUnits(balance, decimals),
        address: tokenAddress,
        type: 'ERC20'
      };
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return {
        name: 'Unknown',
        symbol: 'UNK',
        balance: '0',
        address: tokenAddress,
        type: 'ERC20'
      };
    }
  };

  const getTokenBalances = async (): Promise<TokenBalance[]> => {
    if (!wallet || wallet.provider !== 'ethereum') {
      return [];
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const ethBalanceWei = await provider.getBalance(wallet.address);
      const ethBalance = ethers.formatEther(ethBalanceWei);
      
      const nativeToken: TokenBalance = {
        name: 'SepoliaETH',
        symbol: 'SEP',
        balance: ethBalance,
        address: '0x0000000000000000000000000000000000000000',
        type: 'NATIVE'
      };

      const erc20Tokens = [
        {
          name: 'Chainlink Token',
          symbol: 'LINK',
          address: '0x779877a7b0d9e8603169ddbd7836e478b4624789'
        }
      ];

      const erc20Balances: TokenBalance[] = [];
      for (const token of erc20Tokens) {
        try {
          const balance = await getTokenBalance(token.address, wallet.address);
          erc20Balances.push({
            ...balance,
            type: 'ERC20'
          });
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error);
          erc20Balances.push({
            ...token,
            balance: '0',
            type: 'ERC20'
          });
        }
      }

      return [nativeToken, ...erc20Balances];

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
