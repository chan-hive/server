import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileMetadataColumns1650810800880 implements MigrationInterface {
    name = "AddFileMetadataColumns1650810800880";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`metadata\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`metadataChecked\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`metadataChecked\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`metadata\``);
    }
}
