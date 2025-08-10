import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContributionController } from './contribution.controller';
import { ContributionService } from './contribution.service';
import { Contribution, ContributionSchema } from './schemas/contribution.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contribution.name, schema: ContributionSchema },
    ]),
  ],
  controllers: [ContributionController],
  providers: [ContributionService],
})
export class ContributionModule {}