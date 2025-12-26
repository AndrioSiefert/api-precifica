import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdatePurchaseBatchDto {
  @IsOptional()
  @IsDateString()
  purchasedOn?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
