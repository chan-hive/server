import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostContentColumn1644460540268 implements MigrationInterface {
    name = "AddPostContentColumn1644460540268";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`content\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`content\``);
    }
}
