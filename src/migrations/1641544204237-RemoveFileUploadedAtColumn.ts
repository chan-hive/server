import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveFileUploadedAtColumn1641544204237 implements MigrationInterface {
    name = "RemoveFileUploadedAtColumn1641544204237";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`uploadedAt\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`uploadedAt\` datetime NOT NULL`);
    }
}
