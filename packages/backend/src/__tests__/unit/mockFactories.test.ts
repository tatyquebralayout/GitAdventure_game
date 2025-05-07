import { WorldFactory } from '../../mocks/factories/WorldFactory';
import { QuestFactory } from '../../mocks/factories/QuestFactory';
import { ModuleTheme, WorldDifficulty } from '@shared/types';
import { World } from '../../entities/World';
import { Quest } from '../../entities/Quest';
import { ModuleFactory } from '../../mocks/factories/ModuleFactory';

describe('Mock Factories', () => {
  describe('WorldFactory', () => {
    it('should create a single world', () => {
      const world = WorldFactory.create({
        theme: ModuleTheme.GIT_BASICS,
        difficulty: WorldDifficulty.BEGINNER
      });

      expect(world.id).toMatch(/^world-\d+-[a-z0-9]+$/);
      expect(world.theme).toBe(ModuleTheme.GIT_BASICS);
      expect(world.difficulty).toBe(WorldDifficulty.BEGINNER);
      expect(world.name).toBeTruthy();
      expect(world.description).toBeTruthy();
      expect(world.requiredWorlds).toBeInstanceOf(Array);
    });

    it('should create a progression of worlds', () => {
      const worlds = WorldFactory.createProgression(4);
      
      expect(worlds).toHaveLength(4);
      expect(worlds[0].difficulty).toBe(WorldDifficulty.BEGINNER);
      expect(worlds[worlds.length - 1].difficulty).toBe(WorldDifficulty.ADVANCED);
      
      // Check progression links
      worlds.slice(1).forEach((world, index) => {
        expect(world.requiredWorlds).toContain(worlds[index].id);
      });
    });

    it('should create themed worlds', () => {
      const gitWorlds = WorldFactory.createByTheme(ModuleTheme.GIT_BASICS, 2);
      const githubWorlds = WorldFactory.createByTheme(ModuleTheme.GITHUB, 2);

      expect(gitWorlds).toHaveLength(2);
      expect(githubWorlds).toHaveLength(2);

      gitWorlds.forEach(world => {
        expect(world.theme).toBe(ModuleTheme.GIT_BASICS);
      });

      githubWorlds.forEach(world => {
        expect(world.theme).toBe(ModuleTheme.GITHUB);
      });
    });

    it('should handle optional world properties', () => {
      const customWorld = WorldFactory.create({
        name: 'Custom World',
        description: 'Custom Description',
        requiredWorlds: ['world-1', 'world-2']
      });

      expect(customWorld.name).toBe('Custom World');
      expect(customWorld.description).toBe('Custom Description');
      expect(customWorld.requiredWorlds).toEqual(['world-1', 'world-2']);
    });
  });

  describe('QuestFactory', () => {
    let world: World;

    beforeEach(() => {
      world = WorldFactory.create({
        theme: ModuleTheme.GIT_BASICS,
        difficulty: WorldDifficulty.BEGINNER
      });
    });

    it('should create a single quest', () => {
      const quest = QuestFactory.create({ worldId: world.id });

      expect(quest.id).toMatch(/^quest-\d+-[a-z0-9]+$/);
      expect(quest.worldId).toBe(world.id);
      expect(quest.title).toBeTruthy();
      expect(quest.description).toBeTruthy();
      expect(quest.steps).toBeInstanceOf(Array);
      expect(quest.moduleId).toBeTruthy();
    });

    it('should create quests for a world', () => {
      const quests = QuestFactory.createForWorld(world, 3);

      expect(quests).toHaveLength(3);
      quests.forEach(quest => {
        expect(quest.worldId).toBe(world.id);
        expect(quest.theme).toBe(world.theme);
      });
    });

    it('should create quest steps', () => {
      const quest = QuestFactory.create({
        worldId: world.id,
        stepCount: 3
      });

      expect(quest.steps).toHaveLength(3);
      quest.steps.forEach(step => {
        expect(step.questId).toBe(quest.id);
        expect(step.order).toBeGreaterThanOrEqual(0);
        expect(step.order).toBeLessThan(3);
      });
    });

    it('should create quests with narratives', () => {
      const quest = QuestFactory.create({
        worldId: world.id,
        includeNarratives: true
      });

      expect(quest.narratives).toBeDefined();
      expect(quest.narratives?.length).toBeGreaterThan(0);
      quest.narratives?.forEach(narrative => {
        expect(narrative.questId).toBe(quest.id);
        expect(narrative.content).toBeTruthy();
      });
    });

    it('should create themed quests', () => {
      const gitQuest = QuestFactory.create({
        worldId: world.id,
        theme: ModuleTheme.GIT_BASICS
      });

      expect(gitQuest.theme).toBe(ModuleTheme.GIT_BASICS);
      expect(gitQuest.title).toMatch(/git/i);
      expect(gitQuest.description).toMatch(/git/i);
    });

    it('should handle quest dependencies', () => {
      const quests = QuestFactory.createForWorld(world, 3, true);

      // Check that quests are properly linked
      quests.slice(1).forEach((quest, index) => {
        expect(quest.requiredQuestIds).toContain(quests[index].id);
      });
    });
  });
});