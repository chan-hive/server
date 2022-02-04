import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBoardDescriptionColumn1643937610868 implements MigrationInterface {
    name = "AddBoardDescriptionColumn1643937610868";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`boards\` ADD \`description\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`boards\` DROP COLUMN \`description\``);
    }
}
