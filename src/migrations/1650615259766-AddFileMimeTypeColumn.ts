import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileMimeTypeColumn1650615259766 implements MigrationInterface {
    name = "AddFileMimeTypeColumn1650615259766";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE \`files\` ADD \`mime\` varchar(255) NOT NULL DEFAULT 'application/octet-stream'`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`mime\``);
    }
}
