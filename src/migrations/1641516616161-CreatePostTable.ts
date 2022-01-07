import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePostTable1641516616161 implements MigrationInterface {
    name = "CreatePostTable1641516616161";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`posts\` (\`no\` int NOT NULL, \`name\` text NOT NULL, \`title\` text NULL, \`content\` text NULL, \`isOP\` tinyint NOT NULL, \`createdAt\` datetime NOT NULL, PRIMARY KEY (\`no\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`posts\``);
    }
}
