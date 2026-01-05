import { MigrationInterface, QueryRunner } from "typeorm";

export class NewPurchaseBatch1767647826274 implements MigrationInterface {
    name = 'NewPurchaseBatch1767647826274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_batches" ADD "defaultMarkupPercent" numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_batches" DROP COLUMN "defaultMarkupPercent"`);
    }

}
