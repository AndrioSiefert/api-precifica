import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class FinalizePurchaseCaptureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costUnit: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  markupOverridePercent?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  saleUnitManual?: number;

  @IsOptional()
  @IsIn(['markup', 'sale'])
  updatedField?: 'markup' | 'sale';
}
