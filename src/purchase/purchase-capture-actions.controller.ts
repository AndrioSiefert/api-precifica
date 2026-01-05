import { Body, Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { PurchaseCaptureService } from './purchase-capture.service';
import { FinalizePurchaseCaptureDto } from './dto/finalize-purchase-capture.dto';

@Controller('purchase-captures')
export class PurchaseCaptureActionsController {
  constructor(private readonly service: PurchaseCaptureService) {}

  @Post(':id/finalize')
  finalize(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: FinalizePurchaseCaptureDto,
  ) {
    return this.service.finalizeCapture(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.service.deleteCapture(id);
  }
}
