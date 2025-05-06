import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThemeToWorld1720502325005 implements MigrationInterface {
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add theme column to the worlds table with 'general' as the default value
        await queryRunner.query(`
            ALTER TABLE "worlds"
            ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'general'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the theme column if rollback is needed
        await queryRunner.query(`
            ALTER TABLE "worlds"
            DROP COLUMN "theme"
        `);
    }
}