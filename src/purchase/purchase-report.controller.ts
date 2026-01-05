import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PurchaseReportService } from './purchase-report.service';

@Controller('purchase-batches')
export class PurchaseReportController {
  constructor(private readonly service: PurchaseReportService) {}

  @Get(':id/report')
  report(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.getBatchReport(id);
  }
}
