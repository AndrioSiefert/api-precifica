import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { PurchaseBatchService } from "./purchase-batch.service";
import { CreatePurchaseBatchDto } from "./create-purchase-batch.dto";
import { UpdatePurchaseBatchDto } from "./update-purchase-batch.dto";

@Controller('purchase-batches')
export class PurchaseBatchController {
    constructor(
        private readonly service: PurchaseBatchService
    ){}

    @Post()
    create(@Body() dto:CreatePurchaseBatchDto){
        return this.service.create(dto)
    }

    @Get()
    findAll(){
        return this.service.findAll()
    }

    @Patch(':id')
    update(
        @Param('id', new  ParseUUIDPipe()) id: string, 
        @Body() dto: UpdatePurchaseBatchDto
    ) { 
        return this.service.update(id, dto);
    }
}