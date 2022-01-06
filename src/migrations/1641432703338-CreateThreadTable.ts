import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateThreadTable1641432703338 implements MigrationInterface {
    name = "CreateThreadTable1641432703338";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`threads\` (\`id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`threads\``);
    }
}
