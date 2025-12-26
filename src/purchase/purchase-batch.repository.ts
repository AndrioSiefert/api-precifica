import { InjectRepository } from "@nestjs/typeorm";
import { PurchaseBatchEntity } from "./purchase-batch.entity";
import { Repository } from "typeorm";

export class PurchaseBatchRepository {
    constructor(
        @InjectRepository(PurchaseBatchEntity)
        private readonly repo: Repository<PurchaseBatchEntity>
    ){}

    create(data: Partial<PurchaseBatchEntity>){
        return this.repo.create(data)
    }

    save(batch: PurchaseBatchEntity){
        return this.repo.save(batch)
    }

    findAll(){
        return this.repo.find({
            order: {
                purchasedOn: 'DESC', createdAt: 'DESC'
            }
        })
    }

    findById(id: string){
        return this.repo.findOne({
            where: {id}
        })
    }
}