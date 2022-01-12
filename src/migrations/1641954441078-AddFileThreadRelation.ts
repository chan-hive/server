import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileThreadRelation1641954441078 implements MigrationInterface {
    name = "AddFileThreadRelation1641954441078";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` ADD \`threadId\` int NULL`);
        await queryRunner.query(
            `ALTER TABLE \`files\` ADD CONSTRAINT \`FK_e1f9af6252f0fe9cb22f94e152d\` FOREIGN KEY (\`threadId\`) REFERENCES \`threads\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`files\` DROP FOREIGN KEY \`FK_e1f9af6252f0fe9cb22f94e152d\``);
        await queryRunner.query(`ALTER TABLE \`files\` DROP COLUMN \`threadId\``);
    }
}
