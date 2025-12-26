import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseCapture1766782356432 implements MigrationInterface {
    name = 'PurchaseCapture1766782356432'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_captures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "batchId" uuid NOT NULL, "photoKey" text NOT NULL, "photoMime" text NOT NULL, "status" text NOT NULL DEFAULT 'draft', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_dbb26187056e233ba4e5fd205f3" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "purchase_captures"`);
    }

}
