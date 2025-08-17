import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ContributionService } from './contribution.service';

@Controller('contributions')
export class ContributionController {
  constructor(private readonly service: ContributionService) {}

  @Post()
  async create(@Body() body: any) {
    return this.service.create({
      from: body.from,
      txHash: body.txHash,
      network: body.network,
      amountEth: body.amountEth,
      tokenAmount: body.tokenAmount,
    });
  }

  // GET /contributions/me?address=...
  @Get('me')
  async getMyContributions(@Query('address') address: string) {
    if (!address) return [];
    return this.service.findByAddress(address);
  }

  // GET /contributions/total
  @Get('total')
  async getTotal() {
    return this.service.getTotal();
  }
}