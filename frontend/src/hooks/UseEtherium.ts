// services/useEthereum.ts
import { ethers } from 'ethers';
import { saveContribution } from '@/services/api';

// Адрес получателя (замените на ваш реальный адрес)
const RECIPIENT_ADDRESS = import.meta.env.VITE_RECIPIENT_ADDRESS || '0x1234567890123456789012345678901234567890';

// Курс конвертации (1 ETH = 1000 XTK)
const CONVERSION_RATE = 1000;

export const sendContribution = async (
  amount: string,
  userAddress: string,
  network: 'ethereum' | 'solana'
) => {
  // Проверяем, что это Ethereum сеть
  if (network !== 'ethereum') {
    throw new Error('This function only supports Ethereum network');
  }

  // Проверяем наличие MetaMask
  if (!window.ethereum) {
    throw new Error('MetaMask not found. Please install MetaMask.');
  }

  try {
    // Создаем провайдер и получаем signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Отправляем транзакцию
    const tx = await signer.sendTransaction({
      to: RECIPIENT_ADDRESS,
      value: ethers.parseEther(amount),
    });

    // Ждем подтверждения транзакции
    const receipt = await tx.wait();

    if (receipt === null) {
      throw new Error('Transaction was not mined (receipt is null).');
    }
    
    // Проверяем статус транзакции
    if (receipt.status !== 1) {
      throw new Error('Transaction failed on the blockchain.');
    }

    // Сохраняем информацию о вкладе в бэкенд
    const contributionData = {
      from: userAddress,
      txHash: tx.hash,
      network,
      amountEth: parseFloat(amount),
      tokenAmount: parseFloat(amount) * CONVERSION_RATE,
    };
    
    await saveContribution(contributionData);

    // Возвращаем хэш транзакции
    return tx.hash;
  } catch (error: any) {
    console.error("Contribution error:", error);
    // Пробрасываем ошибку для отображения пользователю
    throw new Error(error.message || error.reason || 'Failed to send contribution.');
  }
};