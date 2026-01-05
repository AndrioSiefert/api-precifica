import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PurchaseReportPdfService } from './purchase-report-pdf.service';

@Controller('purchase-batches')
export class PurchaseReportPdfController {
  constructor(private readonly pdfService: PurchaseReportPdfService) {}

  @Get(':id/report.pdf')
  async downloadPdf(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
  ) {
    const { stream, filename } = await this.pdfService.buildBatchPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    stream.pipe(res);
  }
}
