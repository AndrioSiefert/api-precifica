import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingSettingsEntity } from './pricing-settings.entity';
import { PricingSettingsService } from './pricing-settings.service';
import { PricingSettingsController } from './pricing-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PricingSettingsEntity])],
  providers: [PricingSettingsService],
  controllers: [PricingSettingsController],
  exports: [PricingSettingsService],
})
export class PricingModule {}
