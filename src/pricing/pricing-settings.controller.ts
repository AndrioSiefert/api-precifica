import { Body, Controller, Get, Patch } from '@nestjs/common';
import { PricingSettingsService } from './pricing-settings.service';
import { UpdatePricingSettingsDto } from './dto/updatePricingSettings.dto';

@Controller('pricing-settings')
export class PricingSettingsController {
  constructor(private readonly service: PricingSettingsService) {}

  @Get()
  get() {
    return this.service.getOrCreate();
  }

  @Patch()
  update(@Body() dto: UpdatePricingSettingsDto) {
    return this.service.updateDefaultMarkupPercent(dto.defaultMarkupPercent);
  }

  @Patch('reset')
  reset() {
    return this.service.resetDefaultMarkupPercent();
  }
}
