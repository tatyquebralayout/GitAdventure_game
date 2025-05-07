import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1719502325000 implements MigrationInterface {
    name = 'InitialSchema1719502325000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionar extensão para UUIDs
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // 1. Usuários e Tokens
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "username" TEXT NOT NULL UNIQUE,
                "email" TEXT NOT NULL UNIQUE,
                "password" TEXT NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "user_tokens" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" UUID NOT NULL,
                "access_token" TEXT NOT NULL,
                "refresh_token" TEXT NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "FK_user_tokens_user" FOREIGN KEY ("user_id") 
                REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        // 2. Mundos e Módulos
        await queryRunner.query(`
            CREATE TABLE "worlds" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" TEXT NOT NULL,
                "description" TEXT,
                "slug" TEXT NOT NULL UNIQUE,
                "difficulty" TEXT NOT NULL CHECK (difficulty IN ('beginner','intermediate','advanced')),
                "status" TEXT NOT NULL CHECK (status IN ('draft','review','published'))
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "modules" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" TEXT NOT NULL,
                "description" TEXT
            )
        `);

        // 3. Quests, Módulos e Narrativas
        await queryRunner.query(`
            CREATE TABLE "quests" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" TEXT NOT NULL,
                "description" TEXT,
                "type" TEXT NOT NULL,
                "parent_quest_id" UUID,
                CONSTRAINT "FK_quest_parent_quest" FOREIGN KEY ("parent_quest_id") 
                REFERENCES "quests"("id")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "quest_modules" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "quest_id" UUID NOT NULL,
                "module_id" UUID NOT NULL,
                CONSTRAINT "FK_quest_modules_quest" FOREIGN KEY ("quest_id") 
                REFERENCES "quests"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_quest_modules_module" FOREIGN KEY ("module_id") 
                REFERENCES "modules"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "quest_narratives" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "quest_id" UUID NOT NULL,
                "status" TEXT NOT NULL CHECK (status IN ('starting','ongoing','completed')),
                "context" TEXT NOT NULL,
                CONSTRAINT "FK_quest_narratives_quest" FOREIGN KEY ("quest_id") 
                REFERENCES "quests"("id") ON DELETE CASCADE
            )
        `);

        // 4. Associação Mundos ↔ Quests
        await queryRunner.query(`
            CREATE TABLE "world_quests" (
                "world_id" UUID NOT NULL,
                "quest_id" UUID NOT NULL,
                "display_order" INT NOT NULL,
                PRIMARY KEY ("world_id", "quest_id"),
                CONSTRAINT "FK_world_quests_world" FOREIGN KEY ("world_id") 
                REFERENCES "worlds"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_world_quests_quest" FOREIGN KEY ("quest_id") 
                REFERENCES "quests"("id") ON DELETE CASCADE
            )
        `);

        // 5. Progresso do Jogador
        await queryRunner.query(`
            CREATE TABLE "player_worlds" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "user_id" UUID NOT NULL,
                "world_id" UUID NOT NULL,
                "status" TEXT NOT NULL CHECK (status IN ('started','completed')),
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "FK_player_worlds_user" FOREIGN KEY ("user_id") 
                REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_player_worlds_world" FOREIGN KEY ("world_id") 
                REFERENCES "worlds"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "player_worlds_quests" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "player_world_id" UUID NOT NULL,
                "quest_id" UUID NOT NULL,
                "status" TEXT NOT NULL CHECK (status IN ('starting','ongoing','completed')),
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "FK_player_worlds_quests_player_world" FOREIGN KEY ("player_world_id") 
                REFERENCES "player_worlds"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_player_worlds_quests_quest" FOREIGN KEY ("quest_id") 
                REFERENCES "quests"("id") ON DELETE CASCADE
            )
        `);

        // 6. Passos de Comando para Quests
        await queryRunner.query(`
            CREATE TABLE "quest_command_steps" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "quest_id" UUID NOT NULL,
                "step_number" INT NOT NULL,
                "command_name" TEXT NOT NULL,
                "command_regex" TEXT NOT NULL,
                "description" TEXT NOT NULL,
                "hint" TEXT,
                "is_optional" BOOLEAN NOT NULL DEFAULT false,
                "expected_pattern" TEXT NOT NULL,
                "success_message" TEXT NOT NULL,
                "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_quest_step_number" UNIQUE ("quest_id", "step_number"),
                CONSTRAINT "FK_quest_command_steps_quest" FOREIGN KEY ("quest_id") 
                REFERENCES "quests"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "player_quest_steps" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "player_worlds_quests_id" UUID NOT NULL,
                "quest_command_step_id" UUID NOT NULL,
                "status" TEXT NOT NULL CHECK (status IN ('pending','completed')) DEFAULT 'pending',
                "executed_at" TIMESTAMPTZ,
                CONSTRAINT "FK_player_quest_steps_player_worlds_quests" FOREIGN KEY ("player_worlds_quests_id") 
                REFERENCES "player_worlds_quests"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_player_quest_steps_quest_command_step" FOREIGN KEY ("quest_command_step_id") 
                REFERENCES "quest_command_steps"("id") ON DELETE CASCADE
            )
        `);

        // 7. Índices Recomendados
        await queryRunner.query(`CREATE INDEX "idx_player_worlds_user" ON "player_worlds"("user_id")`);
        await queryRunner.query(`CREATE INDEX "idx_player_quests_player" ON "player_worlds_quests"("player_world_id")`);
        await queryRunner.query(`CREATE INDEX "idx_quest_steps_quest" ON "quest_command_steps"("quest_id")`);
        await queryRunner.query(`CREATE INDEX "idx_player_steps_progress" ON "player_quest_steps"("player_worlds_quests_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover índices
        await queryRunner.query(`DROP INDEX "idx_player_steps_progress"`);
        await queryRunner.query(`DROP INDEX "idx_quest_steps_quest"`);
        await queryRunner.query(`DROP INDEX "idx_player_quests_player"`);
        await queryRunner.query(`DROP INDEX "idx_player_worlds_user"`);

        // Remover tabelas na ordem inversa de dependência
        await queryRunner.query(`DROP TABLE "player_quest_steps"`);
        await queryRunner.query(`DROP TABLE "quest_command_steps"`);
        await queryRunner.query(`DROP TABLE "player_worlds_quests"`);
        await queryRunner.query(`DROP TABLE "player_worlds"`);
        await queryRunner.query(`DROP TABLE "world_quests"`);
        await queryRunner.query(`DROP TABLE "quest_narratives"`);
        await queryRunner.query(`DROP TABLE "quest_modules"`);
        await queryRunner.query(`DROP TABLE "quests"`);
        await queryRunner.query(`DROP TABLE "modules"`);
        await queryRunner.query(`DROP TABLE "worlds"`);
        await queryRunner.query(`DROP TABLE "user_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }
}