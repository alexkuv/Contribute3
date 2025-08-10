import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ContributionService } from './contribution.service';
import type { ContributionDto } from '../types/contribution.dto';

@Controller('contributions')
export class ContributionController {
  constructor(private readonly service: ContributionService) {}

  @Post()
  async create(@Body() dto: ContributionDto) {
    await this.service.create(dto);
    return { message: 'Contribution saved' };
  }

  @Get()
  async findByAddress(@Query('address') address: string) {
    if (!address) return [];
    return this.service.findByAddress(address);
  }

  @Get('total')
  async getTotal() {
    return this.service.getTotal();
  }
}