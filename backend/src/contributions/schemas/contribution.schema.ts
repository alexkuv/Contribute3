import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Contribution extends Document {
  @Prop({ required: true })
  from: string;

  @Prop({ required: true, unique: true })
  txHash: string;

  @Prop({ required: true, enum: ['ethereum', 'solana'] })
  network: 'ethereum' | 'solana';

  @Prop({ required: true, type: Number })
  amountEth: number;

  @Prop({ type: Number, default: null })
  tokenAmount: number;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const ContributionSchema = SchemaFactory.createForClass(Contribution);