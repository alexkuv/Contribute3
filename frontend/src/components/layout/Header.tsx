import WalletConnect from '@/components/wallet/WalletConnect';
import WalletInfo from '@/components/wallet/WalletInfo';
import type { ConnectedWallet } from '@/types/wallet';

type Props = {
  connected: boolean;
  wallet: ConnectedWallet | null;
  providers: { id: string; name: string; icon: any }[];
  onConnect: (wallet: { provider: string; address: string; balance: string }) => void;
  onDisconnect: () => void;
};

export default function Header({
  connected,
  wallet,
  providers,
  onConnect,
  onDisconnect,
}: Props) {
  return (
    <header className="border-b border-purple-700 px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">Contribute3</h1>

        {connected && wallet ? (
          <WalletInfo wallet={wallet} onDisconnect={onDisconnect} />
        ) : (
          <WalletConnect providers={providers} onConnect={onConnect} />
        )}
      </div>
    </header>
  );
}