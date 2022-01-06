import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThreadIsDeadColumn1641435518084 implements MigrationInterface {
    name = "AddThreadIsDeadColumn1641435518084";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`threads\` ADD \`isDead\` tinyint NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`threads\` DROP COLUMN \`isDead\``);
    }
}
