import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contribution } from './schemas/contribution.schema';

@Injectable()
export class ContributionService {
  constructor(
    @InjectModel(Contribution.name)
    private contributionModel: Model<Contribution>,
  ) {}

  async create(data: {
    from: string;
    txHash: string;
    network: 'ethereum' | 'solana';
    amountEth: number;
    tokenAmount: number;
  }): Promise<Contribution> {
    const created = new this.contributionModel(data);
    return created.save();
  }

  async findByAddress(address: string): Promise<Contribution[]> {
    return this.contributionModel.find({ from: address }).exec();
  }

  async getTotal() {
    const result = await this.contributionModel.aggregate([
      {
        $group: {
          _id: null,
          totalEth: { $sum: '$amountEth' },
          totalTokens: { $sum: '$tokenAmount' },
          count: { $sum: 1 },
        },
      },
    ]);
    const totals = result[0] || { totalEth: 0, totalTokens: 0, count: 0 };
    return {
      totalEth: Number(totals.totalEth.toFixed(6)),
      totalTokens: Math.round(totals.totalTokens),
      count: totals.count,
    };
  }
}