import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1766168456202 implements MigrationInterface {
    name = 'InitialSchema1766168456202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "pricing_settings" ("id" text NOT NULL, "defaultMarkupPercent" numeric(10,2), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_622d1dfc3ddcd144464036020fb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "costUnit" numeric(12,2) NOT NULL, "quantity" integer NOT NULL, "photoKey" text, "photoMime" text, "markupOverridePercent" numeric(10,2), "saleUnitManual" numeric(12,2), "purchasedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TABLE "pricing_settings"`);
    }

}
