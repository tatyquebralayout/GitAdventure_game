import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPerformanceIndexes1720502325001 implements MigrationInterface {
    name = 'AddPerformanceIndexes1720502325001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Índices para user_tokens
        await queryRunner.query(`CREATE INDEX "idx_user_tokens_access" ON "user_tokens"("access_token")`);
        
        // Índices compostos para users
        await queryRunner.query(`CREATE INDEX "idx_users_auth" ON "users"("username", "email")`);
        
        // Índices para tracking de progresso
        await queryRunner.query(`CREATE INDEX "idx_player_quest_steps_time" ON "player_quest_steps"("executed_at")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_player_quest_steps_time"`);
        await queryRunner.query(`DROP INDEX "idx_users_auth"`);
        await queryRunner.query(`DROP INDEX "idx_user_tokens_access"`);
    }
}