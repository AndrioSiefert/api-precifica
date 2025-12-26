import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseBatches1766781100512 implements MigrationInterface {
    name = 'PurchaseBatches1766781100512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_batches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "purchasedOn" date NOT NULL, "title" text, "notes" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3629b41c526acdb4a0833404d54" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "purchase_batches"`);
    }

}
