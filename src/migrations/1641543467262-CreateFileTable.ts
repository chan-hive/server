import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFileTable1641543467262 implements MigrationInterface {
    name = "CreateFileTable1641543467262";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE \`files\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` text NOT NULL, \`extension\` text NOT NULL, \`md5\` varchar(255) NOT NULL, \`size\` int NOT NULL, \`width\` int NOT NULL, \`height\` int NOT NULL, \`thumbnailWidth\` int NOT NULL, \`thumbnailHeight\` int NOT NULL, \`uploadedTimestamp\` int NOT NULL, \`uploadedAt\` datetime NOT NULL, UNIQUE INDEX \`IDX_dc9ddaa61537885fe3a236eb15\` (\`md5\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_dc9ddaa61537885fe3a236eb15\` ON \`files\``);
        await queryRunner.query(`DROP TABLE \`files\``);
    }
}
