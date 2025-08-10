import type { ConnectedWallet } from '../../types/wallet';
import { shortenAddress } from '../../utils/walletUtils';
import Button from '../ui/Button';

type Props = {
  wallet: ConnectedWallet;
  onDisconnect: () => void;
};

export default function WalletInfo({ wallet, onDisconnect }: Props) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-purple-700 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-3">Wallet Connected</h2>
      <p><strong>Network:</strong> {wallet.provider === 'ethereum' ? 'Ethereum' : 'Solana'}</p>
      <p><strong>Address:</strong> {shortenAddress(wallet.address)}</p>
      <p><strong>ETH Balance:</strong> {wallet.balance} ETH</p>
      <Button variant="danger" onClick={onDisconnect} className="mt-4">
        Disconnect {shortenAddress(wallet.address)}
      </Button>
    </div>
  );
}