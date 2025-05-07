import { ModuleFactory } from '../../../mocks/factories/ModuleFactory';
import { Module } from '../../../entities/Module';
import { ModuleTheme } from '@shared/types';

describe('ModuleFactory', () => {
  describe('create()', () => {
    it('should create a module with default values', () => {
      const module = ModuleFactory.create();
      
      expect(module).toBeInstanceOf(Module);
      expect(module.id).toBeDefined();
      expect(module.name).toBeDefined();
      expect(module.description).toBeDefined();
      expect(module.theme).toBeDefined();
      expect(module.order).toBeGreaterThanOrEqual(0);
      expect(module.prerequisites).toEqual([]);
      expect(module.questModules).toEqual([]);
    });

    it('should create a module with override values', () => {
      const override = {
        name: 'Custom Module',
        theme: ModuleTheme.GIT_BASICS,
        order: 42
      };

      const module = ModuleFactory.create(override);

      expect(module.name).toBe(override.name);
      expect(module.theme).toBe(override.theme);
      expect(module.order).toBe(override.order);
    });
  });

  describe('createMany()', () => {
    it('should create multiple modules', () => {
      const count = 3;
      const modules = ModuleFactory.createMany(count);

      expect(modules).toHaveLength(count);
      modules.forEach(module => {
        expect(module).toBeInstanceOf(Module);
      });
    });

    it('should create multiple modules with override values', () => {
      const count = 2;
      const override = { theme: ModuleTheme.ADVANCED };
      const modules = ModuleFactory.createMany(count, override);

      expect(modules).toHaveLength(count);
      modules.forEach(module => {
        expect(module.theme).toBe(override.theme);
      });
    });
  });

  describe('createSequential()', () => {
    it('should create modules with sequential order', () => {
      const count = 4;
      const themes = [ModuleTheme.GIT_BASICS, ModuleTheme.BRANCHING];
      const modules = ModuleFactory.createSequential(count, themes);

      expect(modules).toHaveLength(count);
      
      // Verifica ordem sequencial
      modules.forEach((module, index) => {
        expect(module.order).toBe(index);
      });

      // Verifica distribuição dos temas
      expect(modules[0].theme).toBe(themes[0]);
      expect(modules[1].theme).toBe(themes[0]);
      expect(modules[2].theme).toBe(themes[1]);
      expect(modules[3].theme).toBe(themes[1]);
    });

    it('should set prerequisites correctly', () => {
      const count = 3;
      const themes = [ModuleTheme.GIT_BASICS, ModuleTheme.ADVANCED];
      const modules = ModuleFactory.createSequential(count, themes);

      expect(modules[0].prerequisites).toHaveLength(0);
      expect(modules[1].prerequisites).toHaveLength(1);
      expect(modules[2].prerequisites).toHaveLength(1);
    });
  });
});