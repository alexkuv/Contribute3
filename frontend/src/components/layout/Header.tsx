// components/layout/Header.tsx
import React from 'react';
import type { WalletProvider, ConnectedWallet, WalletType } from '@/types/wallet';
import { shortenAddress } from '@/utils/walletUtils';
import Button from '@/components/ui/Button';

type Props = {
  connected: boolean;
  wallet: ConnectedWallet | null;
  providers: WalletProvider[];
  onConnect: (providerId: WalletType) => void;
  onDisconnect: () => void;
};

const Header: React.FC<Props> = ({ connected, wallet, providers, onConnect, onDisconnect }) => {
  return (
    <header className="bg-gray-900 border-b border-purple-700 py-4">
      <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-400">CrowdFund DApp</h1>
        <div>
          {connected && wallet ? (
            <div className="bg-white/10 backdrop-blur-sm border border-purple-700 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm"><strong>Network:</strong> {wallet.provider === 'ethereum' ? 'Ethereum' : 'Solana'}</p>
                <p className="text-sm"><strong>Address:</strong> {shortenAddress(wallet.address)}</p>
                <p className="text-sm"><strong>Balance:</strong> {wallet.balance} {wallet.provider === 'ethereum' ? 'ETH' : 'SOL'}</p>
              </div>
              <Button onClick={onDisconnect} variant="danger" size="sm">
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {providers.map((provider) => {
                const Icon = provider.icon;
                return (
                  <Button
                    key={provider.id}
                    onClick={() => onConnect(provider.id)}
                    variant="primary"
                    className="flex items-center"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    Connect {provider.name}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;