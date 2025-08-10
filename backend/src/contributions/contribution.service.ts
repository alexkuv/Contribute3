import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contribution, ContributionDocument } from './schemas/contribution.schema';
import type { ContributionDto } from '../types/contribution.dto';

@Injectable()
export class ContributionService {
  constructor(
    @InjectModel(Contribution.name) private contributionModel: Model<ContributionDocument>,
  ) {}

  async create(dto: ContributionDto): Promise<Contribution> {
    const created = new this.contributionModel({
      ...dto,
      timestamp: new Date(dto.timestamp),
    });
    return created.save();
  }

  async findByAddress(address: string): Promise<Contribution[]> {
    return this.contributionModel.find({ from: address.toLowerCase() }).exec();
  }

  async getTotal(): Promise<{ totalEth: number; totalTokens: number }> {
    const result = await this.contributionModel.aggregate([
      {
        $group: {
          _id: null,
          totalEth: { $sum: '$amountEth' },
          totalTokens: { $sum: '$tokenAmount' },
        },
      },
    ]);

    const totals = result[0] || { totalEth: 0, totalTokens: 0 };
    return {
      totalEth: +totals.totalEth.toFixed(6),
      totalTokens: +totals.totalTokens.toFixed(2),
    };
  }
}