import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePurchaseBatchDto } from "./dto/create-purchase-batch.dto";
import { PurchaseBatchRepository } from "./purchase-batch.repository";
import { UpdatePurchaseBatchDto } from "./dto/update-purchase-batch.dto";

@Injectable()
export class PurchaseBatchService{
    constructor(
        private readonly repo: PurchaseBatchRepository
    ){}

    create(dto: CreatePurchaseBatchDto){
        const batch  = this.repo.create({
            purchasedOn: dto.purchasedOn,
            title: dto.title ?? null,
            notes: dto.notes ?? null,
        })
        return this.repo.save(batch)
    }   

    findAll(){
        return this.repo.findAll();
    }

    async update(id: string, dto: UpdatePurchaseBatchDto){
        const batch = await this.repo.findById(id)
        if (!batch) throw new NotFoundException('Batch not found')

        if (dto.purchasedOn !== undefined) batch.purchasedOn = dto.purchasedOn;
        if (dto.title !== undefined) batch.title = dto.title ?? null;
        if (dto.notes !== undefined) batch.notes = dto.notes ?? null;

        return this.repo.save(batch)
    }

}