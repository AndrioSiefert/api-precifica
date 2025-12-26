import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseBatchEntity } from './purchase-batch.entity';
import { PurchaseBatchRepository } from './purchase-batch.repository';
import { PurchaseBatchService } from './purchase-batch.service';
import { PurchaseBatchController } from './purchase-batch.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseBatchEntity])],
  controllers: [PurchaseBatchController],
  providers: [PurchaseBatchRepository, PurchaseBatchService],
  exports: [PurchaseBatchRepository, PurchaseBatchService],
})
export class PurchaseModule {}
