import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateItemDto } from './dto/createItem.dto';
import { UpdateItemDto } from './dto/updateItem.dto';
import { memoryStorage } from 'multer';
import { ItemService } from './item.service';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
    }),
  )
  create(
    @Body() dto: CreateItemDto,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    return this.itemService.createItem(dto, photo);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemService.updateItem(id, dto);
  }

  @Patch(':id/pricing/reset')
  resetPricing(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.itemService.resetPricing(id);
  }
}
