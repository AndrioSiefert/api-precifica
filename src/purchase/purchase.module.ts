import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageModule } from '../storage/storage.module';
import { ItemModule } from '../item/item.module';
import { PurchaseBatchEntity } from './purchase-batch.entity';
import { PurchaseBatchRepository } from './purchase-batch.repository';
import { PurchaseBatchService } from './purchase-batch.service';
import { PurchaseBatchController } from './purchase-batch.controller';
import { PurchaseCaptureEntity } from './purchase-capture.entity';
import { PurchaseCaptureRepository } from './purchase-capture.repository';
import { PurchaseCaptureService } from './purchase-capture.service';
import { PurchaseCaptureController } from './purchase-capture.controller';
import { PurchaseCaptureActionsController } from './purchase-capture-actions.controller';
import { PurchaseReportService } from './purchase-report.service';
import { PurchaseReportController } from './purchase-report.controller';
import { PurchaseReportPdfService } from './purchase-report-pdf.service';
import { PurchaseReportPdfController } from './purchase-report-pdf.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseBatchEntity, PurchaseCaptureEntity]),
    StorageModule,
    ItemModule,
  ],
  controllers: [
    PurchaseBatchController,
    PurchaseCaptureController,
    PurchaseCaptureActionsController,
    PurchaseReportController,
    PurchaseReportPdfController,
  ],
  providers: [
    PurchaseBatchRepository,
    PurchaseBatchService,
    PurchaseCaptureRepository,
    PurchaseCaptureService,
    PurchaseReportService,
    PurchaseReportPdfService,
  ],
  exports: [
    PurchaseBatchRepository,
    PurchaseBatchService,
    PurchaseCaptureRepository,
    PurchaseCaptureService,
    PurchaseReportService,
    PurchaseReportPdfService,
  ],
})
export class PurchaseModule {}
