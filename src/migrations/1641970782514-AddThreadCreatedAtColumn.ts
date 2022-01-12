import {MigrationInterface, QueryRunner} from "typeorm";

export class AddThreadCreatedAtColumn1641970782514 implements MigrationInterface {
    name = 'AddThreadCreatedAtColumn1641970782514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`threads\` ADD \`createdAt\` datetime NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`threads\` DROP COLUMN \`createdAt\``);
    }

}
