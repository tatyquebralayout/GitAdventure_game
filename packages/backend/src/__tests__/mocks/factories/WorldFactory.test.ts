import { WorldFactory } from '../../../mocks/factories/WorldFactory';
import { World } from '../../../entities/World';

describe('WorldFactory', () => {
  describe('create', () => {
    it('should create a world with default values', () => {
      const world = WorldFactory.create();

      expect(world).toBeInstanceOf(World);
      expect(world.id).toBeDefined();
      expect(world.name).toBeDefined();
      expect(world.slug).toBeDefined();
      expect(world.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
      expect(world.status).toMatch(/^(draft|review|published)$/);
    });

    it('should honor override values', () => {
      const override = {
        name: 'Git Mastery',
        description: 'Master Git',
        slug: 'git-mastery',
        difficulty: 'advanced',
        status: 'published'
      };

      const world = WorldFactory.create(override);

      expect(world.name).toBe(override.name);
      expect(world.description).toBe(override.description);
      expect(world.slug).toBe(override.slug);
      expect(world.difficulty).toBe(override.difficulty);
      expect(world.status).toBe(override.status);
    });

    it('should generate unique IDs for each world', () => {
      const world1 = WorldFactory.create();
      const world2 = WorldFactory.create();

      expect(world1.id).not.toBe(world2.id);
    });

    it('should generate valid slug from name', () => {
      const world = WorldFactory.create({
        name: 'Git & Version Control 101!'
      });

      expect(world.slug).toBe('git-version-control-101');
    });
  });

  describe('createMany', () => {
    it('should create specified number of worlds', () => {
      const count = 3;
      const worlds = WorldFactory.createMany(count);

      expect(worlds).toHaveLength(count);
      worlds.forEach(world => {
        expect(world).toBeInstanceOf(World);
      });
    });

    it('should apply overrides to all created worlds', () => {
      const override = {
        difficulty: 'intermediate',
        status: 'published'
      };

      const worlds = WorldFactory.createMany(2, override);

      worlds.forEach(world => {
        expect(world.difficulty).toBe(override.difficulty);
        expect(world.status).toBe(override.status);
      });
    });

    it('should create unique worlds', () => {
      const worlds = WorldFactory.createMany(3);
      const ids = worlds.map(w => w.id);
      const slugs = worlds.map(w => w.slug);

      expect(new Set(ids).size).toBe(worlds.length);
      expect(new Set(slugs).size).toBe(worlds.length);
    });
  });

  describe('createProgression', () => {
    it('should create worlds with increasing difficulty', () => {
      const worlds = WorldFactory.createProgression(3);

      expect(worlds[0].difficulty).toBe('beginner');
      expect(worlds[1].difficulty).toBe('intermediate');
      expect(worlds[2].difficulty).toBe('advanced');
    });

    it('should create connected worlds', () => {
      const worlds = WorldFactory.createProgression(2);

      expect(worlds[1].requiredWorlds).toContain(worlds[0].id);
    });

    it('should set appropriate status for progression', () => {
      const worlds = WorldFactory.createProgression(3);

      expect(worlds[0].status).toBe('published');
      expect(worlds[1].status).toBe('published');
      expect(worlds[2].status).toBe('review');
    });

    it('should maintain unique slugs in progression', () => {
      const worlds = WorldFactory.createProgression(4);
      const slugs = worlds.map(w => w.slug);
      const uniqueSlugs = new Set(slugs);

      expect(uniqueSlugs.size).toBe(worlds.length);
    });
  });

  describe('generateWorldContent', () => {
    it('should generate appropriate content based on difficulty', () => {
      const beginnerWorld = WorldFactory.create({ difficulty: 'beginner' });
      const advancedWorld = WorldFactory.create({ difficulty: 'advanced' });

      expect(beginnerWorld.quests?.length).toBeLessThan(advancedWorld.quests?.length);
    });

    it('should include appropriate quest types for difficulty', () => {
      const beginnerWorld = WorldFactory.create({ difficulty: 'beginner' });
      const advancedWorld = WorldFactory.create({ difficulty: 'advanced' });

      expect(beginnerWorld.quests?.some(q => q.type === 'tutorial')).toBe(true);
      expect(advancedWorld.quests?.some(q => q.type === 'challenge')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty name gracefully', () => {
      const world = WorldFactory.create({ name: '' });
      expect(world.name).toBeDefined();
      expect(world.slug).toBeDefined();
    });

    it('should handle special characters in name for slug generation', () => {
      const world = WorldFactory.create({
        name: 'Git@Hub & Version#Control!'
      });

      expect(world.slug).toBe('git-hub-version-control');
    });

    it('should handle duplicate names by making unique slugs', () => {
      const name = 'Git Basics';
      const world1 = WorldFactory.create({ name });
      const world2 = WorldFactory.create({ name });

      expect(world1.slug).not.toBe(world2.slug);
    });
  });
});