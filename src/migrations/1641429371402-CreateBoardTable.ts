import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBoardTable1641429371402 implements MigrationInterface {
    name = "CreateBoardTable1641429371402";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`boards\` (\`id\` varchar(20) NOT NULL, \`title\` text NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`boards\``);
    }
}
