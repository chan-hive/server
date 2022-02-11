import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangePostContentColumnName1644460490858 implements MigrationInterface {
    name = "ChangePostContentColumnName1644460490858";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`content\` \`rawContent\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`rawContent\` \`content\` text NULL`);
    }
}
