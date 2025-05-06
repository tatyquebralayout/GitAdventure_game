import { ModuleFactory } from '../../../mocks/factories/ModuleFactory';
import { Module } from '../../../entities/Module';
import { ModuleTheme } from '../../../../shared/types/enums';

describe('ModuleFactory', () => {
  describe('create', () => {
    it('should create a module with default values', () => {
      const module = ModuleFactory.create();

      expect(module).toBeInstanceOf(Module);
      expect(module.id).toBeDefined();
      expect(module.name).toBeDefined();
      expect(module.theme).toBeDefined();
      expect(module.order).toBe(0);
      expect(module.prerequisites).toEqual([]);
    });

    it('should honor override values', () => {
      const override = {
        name: 'Custom Module',
        description: 'Custom Description',
        theme: ModuleTheme.BRANCHING,
        order: 5,
        prerequisites: ['123', '456']
      };

      const module = ModuleFactory.create(override);

      expect(module.name).toBe(override.name);
      expect(module.description).toBe(override.description);
      expect(module.theme).toBe(override.theme);
      expect(module.order).toBe(override.order);
      expect(module.prerequisites).toEqual(override.prerequisites);
    });

    it('should generate unique IDs for each module', () => {
      const module1 = ModuleFactory.create();
      const module2 = ModuleFactory.create();

      expect(module1.id).not.toBe(module2.id);
    });

    it('should use valid default theme', () => {
      const module = ModuleFactory.create();
      const validThemes = Object.values(ModuleTheme);

      expect(validThemes).toContain(module.theme);
    });
  });

  describe('createMany', () => {
    it('should create specified number of modules', () => {
      const count = 3;
      const modules = ModuleFactory.createMany(count);

      expect(modules).toHaveLength(count);
      modules.forEach(module => {
        expect(module).toBeInstanceOf(Module);
      });
    });

    it('should apply overrides to all created modules', () => {
      const override = {
        theme: ModuleTheme.GIT_BASICS,
        description: 'Shared description'
      };

      const modules = ModuleFactory.createMany(2, override);

      modules.forEach(module => {
        expect(module.theme).toBe(override.theme);
        expect(module.description).toBe(override.description);
      });
    });

    it('should create unique modules', () => {
      const modules = ModuleFactory.createMany(3);
      const ids = modules.map(m => m.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(modules.length);
    });
  });

  describe('createSequential', () => {
    it('should create ordered modules with correct themes', () => {
      const count = 4;
      const themeOrder = [ModuleTheme.GIT_BASICS, ModuleTheme.BRANCHING];
      
      const modules = ModuleFactory.createSequential(count, themeOrder);

      expect(modules).toHaveLength(count);
      expect(modules[0].theme).toBe(ModuleTheme.GIT_BASICS);
      expect(modules[1].theme).toBe(ModuleTheme.GIT_BASICS);
      expect(modules[2].theme).toBe(ModuleTheme.BRANCHING);
      expect(modules[3].theme).toBe(ModuleTheme.BRANCHING);
    });

    it('should set correct order and prerequisites', () => {
      const modules = ModuleFactory.createSequential(3, [ModuleTheme.GIT_BASICS]);

      expect(modules[0].order).toBe(0);
      expect(modules[0].prerequisites).toEqual([]);

      expect(modules[1].order).toBe(1);
      expect(modules[1].prerequisites).toHaveLength(1);

      expect(modules[2].order).toBe(2);
      expect(modules[2].prerequisites).toHaveLength(1);
    });

    it('should handle single theme', () => {
      const modules = ModuleFactory.createSequential(2, [ModuleTheme.ADVANCED]);

      modules.forEach(module => {
        expect(module.theme).toBe(ModuleTheme.ADVANCED);
      });
    });

    it('should cycle through themes if more modules than themes', () => {
      const themeOrder = [ModuleTheme.GIT_BASICS, ModuleTheme.BRANCHING];
      const modules = ModuleFactory.createSequential(5, themeOrder);

      expect(modules[4].theme).toBe(ModuleTheme.GIT_BASICS);
    });
  });
});