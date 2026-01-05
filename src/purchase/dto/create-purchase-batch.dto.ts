import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseBatchDto {
  @IsDateString()
  @IsNotEmpty()
  purchasedOn: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsNumber()
  defaultMarkupPercent?: number | null;
}
