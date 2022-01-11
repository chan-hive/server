import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileBoardRelation1641867059085 implements MigrationInterface {
    name = "AddFileBoardRelation1641867059085";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`boardId\` varchar(20) NULL`);
        await queryRunner.query(
            `ALTER TABLE \`files\` ADD CONSTRAINT \`FK_cba0fd8fd040dbed113039c5cda\` FOREIGN KEY (\`boardId\`) REFERENCES \`boards\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_cba0fd8fd040dbed113039c5cda\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`boardId\``);
    }
}
