import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileIsArchivedColumn1641861331032 implements MigrationInterface {
    name = "AddFileIsArchivedColumn1641861331032";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`isArchived\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`isArchived\``);
    }
}
