import { MigrationInterface, QueryRunner } from "typeorm";

export class PurchaseCapture1766785589181 implements MigrationInterface {
    name = 'PurchaseCapture1766785589181'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "purchase_captures" ADD "itemId" uuid`);
        await queryRunner.query(`ALTER TABLE "items" ADD "batchId" uuid`);
        await queryRunner.query(`ALTER TABLE "items" ADD "captureId" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "captureId"`);
        await queryRunner.query(`ALTER TABLE "items" DROP COLUMN "batchId"`);
        await queryRunner.query(`ALTER TABLE "purchase_captures" DROP COLUMN "itemId"`);
    }

}
