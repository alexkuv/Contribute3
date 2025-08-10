import type { WalletProvider } from '../../types/wallet';
import Button from '../ui/Button';
import {getFakeAddress, getFakeBalance} from '../../utils/walletUtils';

type Props = {
  providers: WalletProvider[];
  onConnect: (wallet: { provider: string; address: string; balance: string }) => void;
};

export default function WalletConnect({ providers, onConnect }: Props) {
  const handleConnect = async (provider: WalletProvider) => {
    const address = getFakeAddress(provider.id);
    const balance = getFakeBalance(provider.id);
    onConnect({ provider: provider.id, address, balance });
  };

  return (
    <div className="flex flex-wrap gap-3">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          onClick={() => handleConnect(provider)}
          className="flex items-center gap-2"
        >
          <provider.icon className="w-5 h-5" />
          Connect {provider.name}
        </Button>
      ))}
    </div>
  );
}