import {
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Post,
    UploadedFile,
    UseInterceptors,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { memoryStorage } from 'multer';
  import { PurchaseCaptureService } from './purchase-capture.service';
  
  @Controller('purchase-batches')
  export class PurchaseCaptureController {
    constructor(private readonly service: PurchaseCaptureService) {}
  
    @Post(':id/captures')
    @UseInterceptors(
      FileInterceptor('photo', {
        storage: memoryStorage(),
        limits: { fileSize: 8 * 1024 * 1024 },
      }),
    )
    create(
      @Param('id', new ParseUUIDPipe()) id: string,
      @UploadedFile() photo?: Express.Multer.File,
    ) {
      return this.service.createCapture(id, photo);
    }
  
    @Get(':id/captures')
    list(@Param('id', new ParseUUIDPipe()) id: string) {
      return this.service.listByBatch(id);
    }
  }
  