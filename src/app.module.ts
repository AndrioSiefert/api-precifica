import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConfigService } from './config/postgres.config.service';
import { ConfigModule } from '@nestjs/config';
import { ItemModule } from './item/item.module';
import { PricingModule } from './pricing/pricing.module';
import { PurchaseModule } from './purchase/purchase.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: PostgresConfigService,
      inject: [PostgresConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ItemModule,
    PricingModule,
    PurchaseModule,
  ],
})
export class AppModule {}
