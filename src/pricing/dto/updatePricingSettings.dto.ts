import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePricingSettingsDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  defaultMarkupPercent: number;
}
