import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceUserProgress1720502325004 implements MigrationInterface {
    name = 'EnhanceUserProgress1720502325004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_progress"
            ADD COLUMN "start_time" TIMESTAMPTZ NOT NULL DEFAULT now(),
            ADD COLUMN "time_spent" INTEGER NOT NULL DEFAULT 0,
            ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0,
            ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0
        `);

        // Add tracking indexes
        await queryRunner.query(`CREATE INDEX "idx_user_progress_score" ON "user_progress"("score")`);
        await queryRunner.query(`CREATE INDEX "idx_user_progress_completion" ON "user_progress"("user_id", "is_completed")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_user_progress_completion"`);
        await queryRunner.query(`DROP INDEX "idx_user_progress_score"`);
        
        await queryRunner.query(`
            ALTER TABLE "user_progress"
            DROP COLUMN "score",
            DROP COLUMN "attempts",
            DROP COLUMN "time_spent",
            DROP COLUMN "start_time"
        `);
    }
}