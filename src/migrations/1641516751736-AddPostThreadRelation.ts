import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostThreadRelation1641516751736 implements MigrationInterface {
    name = "AddPostThreadRelation1641516751736";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`threadId\` int NULL`);
        await queryRunner.query(
            `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_358568744a046c3fd71188174f3\` FOREIGN KEY (\`threadId\`) REFERENCES \`threads\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_358568744a046c3fd71188174f3\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`threadId\``);
    }
}
