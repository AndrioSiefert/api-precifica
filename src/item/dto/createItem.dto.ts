import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsDate,
  IsIn,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
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

  @IsOptional()
  @IsIn(['markup', 'sale'])
  updatedField?: 'markup' | 'sale';

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  saleUnitManual?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  purchasedAt?: Date;

  @IsOptional()
  @IsUUID()
  batchId?: string | null;
}
