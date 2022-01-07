import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFileUploadedTimestampColumnType1641544542340 implements MigrationInterface {
    name = "UpdateFileUploadedTimestampColumnType1641544542340";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`uploadedTimestamp\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`uploadedTimestamp\` bigint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`uploadedTimestamp\``);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`uploadedTimestamp\` int NOT NULL`);
    }
}
