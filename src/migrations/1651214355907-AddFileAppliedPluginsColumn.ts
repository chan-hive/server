import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileAppliedPluginsColumn1651214355907 implements MigrationInterface {
    name = "AddFileAppliedPluginsColumn1651214355907";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`appliedPlugins\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`appliedPlugins\``);
    }
}
