import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThreadBoardRelationship1641432891743 implements MigrationInterface {
    name = "AddThreadBoardRelationship1641432891743";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`threads\` ADD \`boardId\` varchar(20) NULL`);
        await queryRunner.query(
            `ALTER TABLE \`threads\` ADD CONSTRAINT \`FK_5432121014648d3a7cfdc2b35ac\` FOREIGN KEY (\`boardId\`) REFERENCES \`boards\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`threads\` DROP FOREIGN KEY \`FK_5432121014648d3a7cfdc2b35ac\``);
        await queryRunner.query(`ALTER TABLE \`threads\` DROP COLUMN \`boardId\``);
    }
}
