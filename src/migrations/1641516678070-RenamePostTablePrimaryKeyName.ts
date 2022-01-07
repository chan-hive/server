import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamePostTablePrimaryKeyName1641516678070 implements MigrationInterface {
    name = "RenamePostTablePrimaryKeyName1641516678070";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`no\` \`id\` int NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` CHANGE \`id\` \`no\` int NOT NULL`);
    }
}
