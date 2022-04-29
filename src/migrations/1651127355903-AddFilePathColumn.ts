import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFilePathColumn1651127355903 implements MigrationInterface {
    name = "AddFilePathColumn1651127355903";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`path\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`path\``);
    }
}
