import { Injectable, NotFoundException } from "@nestjs/common";
import { PurchaseCaptureRepository } from "./purchase-capture.repository";
import { CreatePurchaseBatchDto } from "./dto/create-purchase-batch.dto";
import { PurchaseBatchRepository } from "./purchase-batch.repository";
import { UpdatePurchaseBatchDto } from "./dto/update-purchase-batch.dto";
import { ItemRepository } from "../item/item.repository";
import { MinioService } from "../storage/minio.service";

@Injectable()
export class PurchaseBatchService{
    constructor(
        private readonly repo: PurchaseBatchRepository,
        private readonly captureRepo: PurchaseCaptureRepository,
        private readonly itemRepo: ItemRepository,
        private readonly minio: MinioService,
    ){}

    create(dto: CreatePurchaseBatchDto){
        const batch  = this.repo.create({
            purchasedOn: dto.purchasedOn,
            title: dto.title ?? null,
            notes: dto.notes ?? null,
            defaultMarkupPercent: dto.defaultMarkupPercent ?? null,
        })
        return this.repo.save(batch)
    }   

    findAll(){
        return this.repo.findAll();
    }

    async findById(id: string){
        const batch = await this.repo.findById(id)
        if(!batch) throw new NotFoundException('Batch not found')
        return batch
    }

    async update(id: string, dto: UpdatePurchaseBatchDto){
        const batch = await this.repo.findById(id)
        if (!batch) throw new NotFoundException('Batch not found')

        if (dto.purchasedOn !== undefined) batch.purchasedOn = dto.purchasedOn;
        if (dto.title !== undefined) batch.title = dto.title ?? null;
        if (dto.notes !== undefined) batch.notes = dto.notes ?? null;
        if (dto.defaultMarkupPercent !== undefined) batch.defaultMarkupPercent = dto.defaultMarkupPercent ?? null;

        return this.repo.save(batch)
    }

    async delete(id: string){
        const batch = await this.repo.findById(id)
        if (!batch) throw new NotFoundException('Batch not found')

        const captures = await this.captureRepo.findByBatchId(id)
        const processedKeys = new Set<string>()

        for (const cap of captures){
            if (cap.photoKey && !processedKeys.has(cap.photoKey)){
                try { await this.minio.remove(cap.photoKey) } catch {}
                processedKeys.add(cap.photoKey)
            }
            if (cap.itemId){
                await this.itemRepo.delete(cap.itemId)
            }
            await this.captureRepo.delete(cap.id)
        }

        const items = await this.itemRepo.findByBatchId(id)
        for (const item of items){
            if (item.photoKey && !processedKeys.has(item.photoKey)){
                try { await this.minio.remove(item.photoKey) } catch {}
                processedKeys.add(item.photoKey)
            }
            await this.itemRepo.delete(item.id)
        }

        await this.repo.delete(id)
        return { deleted: true }
    }

}
