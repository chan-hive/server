import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBoardIsWorkSafeColumn1643346408654 implements MigrationInterface {
    name = "AddBoardIsWorkSafeColumn1643346408654";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`boards\` ADD \`isWorkSafe\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`boards\` DROP COLUMN \`isWorkSafe\``);
    }
}
