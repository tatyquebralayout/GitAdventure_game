import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProgressTracking1720502325003 implements MigrationInterface {
    name = 'AddProgressTracking1720502325003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionar campos de tracking em player_quest_steps
        await queryRunner.query(`
            ALTER TABLE "player_quest_steps"
            ADD COLUMN "start_time" TIMESTAMPTZ,
            ADD COLUMN "time_spent" INTEGER DEFAULT 0,
            ADD COLUMN "attempts" INTEGER DEFAULT 0,
            ADD COLUMN "failed_attempts" JSONB DEFAULT '[]',
            ADD COLUMN "score" INTEGER DEFAULT 0,
            ADD COLUMN "bonus_points" INTEGER DEFAULT 0
        `);

        // Adicionar campos de métricas em player_worlds_quests
        await queryRunner.query(`
            ALTER TABLE "player_worlds_quests"
            ADD COLUMN "total_time" INTEGER DEFAULT 0,
            ADD COLUMN "total_attempts" INTEGER DEFAULT 0,
            ADD COLUMN "total_score" INTEGER DEFAULT 0
        `);

        // Índices para consultas de performance
        await queryRunner.query(`CREATE INDEX "idx_steps_score" ON "player_quest_steps"("score")`);
        await queryRunner.query(`CREATE INDEX "idx_quest_total_score" ON "player_worlds_quests"("total_score")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_quest_total_score"`);
        await queryRunner.query(`DROP INDEX "idx_steps_score"`);

        await queryRunner.query(`
            ALTER TABLE "player_worlds_quests"
            DROP COLUMN "total_time",
            DROP COLUMN "total_attempts",
            DROP COLUMN "total_score"
        `);

        await queryRunner.query(`
            ALTER TABLE "player_quest_steps"
            DROP COLUMN "start_time",
            DROP COLUMN "time_spent",
            DROP COLUMN "attempts",
            DROP COLUMN "failed_attempts",
            DROP COLUMN "score",
            DROP COLUMN "bonus_points"
        `);
    }
}