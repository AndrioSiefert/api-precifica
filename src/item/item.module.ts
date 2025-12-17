import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEntity } from './item.entity';
import { ItemController } from './item.controller';
import { ItemRepository } from './item.repository';
import { StorageModule } from 'src/storage/storage.module';
import { ItemService } from './item.service';
import { PricingModule } from 'src/pricing/pricing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemEntity]),
    StorageModule,
    PricingModule,
  ],
  controllers: [ItemController],
  providers: [ItemRepository, ItemService],
  exports: [ItemRepository, ItemService],
})
export class ItemModule {}
