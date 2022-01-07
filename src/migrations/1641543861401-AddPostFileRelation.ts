import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostFileRelation1641543861401 implements MigrationInterface {
    name = "AddPostFileRelation1641543861401";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` ADD \`fileId\` int NULL`);
        await queryRunner.query(
            `ALTER TABLE \`posts\` ADD CONSTRAINT \`FK_d17f46e203758faabfeca2ef841\` FOREIGN KEY (\`fileId\`) REFERENCES \`files\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`posts\` DROP FOREIGN KEY \`FK_d17f46e203758faabfeca2ef841\``);
        await queryRunner.query(`ALTER TABLE \`posts\` DROP COLUMN \`fileId\``);
    }
}
