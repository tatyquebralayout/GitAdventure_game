import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceModules1720502325002 implements MigrationInterface {
    name = 'EnhanceModules1720502325002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Adicionar campos aos módulos
        await queryRunner.query(`
            ALTER TABLE "modules"
            ADD COLUMN "theme" TEXT NOT NULL DEFAULT 'general',
            ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
            ADD COLUMN "prerequisites" UUID[] DEFAULT '{}'::UUID[]
        `);

        // Criar índice para ordem dos módulos
        await queryRunner.query(`CREATE INDEX "idx_modules_order" ON "modules"("order")`);
        
        // Adicionar constraint de verificação para temas válidos
        await queryRunner.query(`
            ALTER TABLE "modules"
            ADD CONSTRAINT "chk_module_theme" 
            CHECK (theme IN ('git-basics', 'branching', 'remote', 'advanced', 'general'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "modules" DROP CONSTRAINT "chk_module_theme"`);
        await queryRunner.query(`DROP INDEX "idx_modules_order"`);
        await queryRunner.query(`
            ALTER TABLE "modules" 
            DROP COLUMN "theme",
            DROP COLUMN "order",
            DROP COLUMN "prerequisites"
        `);
    }
}