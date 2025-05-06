import { TestUtils } from '../setup';
import { WorldTestHelpers, QuestTestHelpers } from '../helpers/testHelpers';
import { SERVICE_TOKENS } from '../../config/services';
import { IAuthService } from '../../services/interfaces/IAuthService';
import { IQuestService } from '../../services/interfaces/IQuestService';
import { IWorldService } from '../../services/interfaces/IWorldService';
import { QuestStatus, ModuleTheme } from '../../../../shared/types/enums';

describe('Mock Services Integration', () => {
  let authService: IAuthService;
  let questService: IQuestService;
  let worldService: IWorldService;

  beforeEach(() => {
    authService = TestUtils.getMockService(SERVICE_TOKENS.AUTH_SERVICE);
    questService = TestUtils.getMockService(SERVICE_TOKENS.QUEST_SERVICE);
    worldService = TestUtils.getMockService(SERVICE_TOKENS.WORLD_SERVICE);
  });

  describe('Complete User Journey', () => {
    it('should support a full user journey through registration, world start, and quest completion', async () => {
      // 1. Register and login
      const { user, accessToken } = await TestUtils.createTestUser('journey_user');
      expect(user).toBeDefined();
      expect(accessToken).toBeDefined();

      // 2. Get available worlds
      const worlds = await worldService.getAllWorlds({
        theme: ModuleTheme.GIT_BASICS,
        includeProgress: true
      });
      expect(worlds.length).toBeGreaterThan(0);

      // 3. Start a world
      const playerWorld = await worldService.startWorld(user.id, worlds[0].id);
      expect(playerWorld.userId).toBe(user.id);
      expect(playerWorld.worldId).toBe(worlds[0].id);

      // 4. Start a quest
      const quests = await questService.getQuestById(worlds[0].worldQuests[0].questId);
      expect(quests).toBeDefined();

      const questProgress = await questService.startQuest(
        user.id,
        quests!.id,
        playerWorld.id
      );
      expect(questProgress.status).toBe(QuestStatus.IN_PROGRESS);

      // 5. Complete quest steps
      const steps = await questService.getQuestCommandSteps(quests!.id);
      for (const step of steps) {
        const result = await questService.completeQuestStep({
          questId: quests!.id,
          stepId: step.id,
          userId: user.id,
          command: step.exampleCommand // Use example command to ensure success
        });
        expect(result.isComplete).toBe(true);
      }

      // 6. Verify quest completion
      const completion = await questService.checkQuestCompletion(quests!.id, user.id);
      expect(completion.isComplete).toBe(true);
      expect(completion.status).toBe(QuestStatus.COMPLETED);

      // 7. Check world progress
      const worldProgress = await worldService.calculateWorldProgress(worlds[0].id, user.id);
      expect(worldProgress.completedQuests).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid world start attempts', async () => {
      const { user } = await TestUtils.createTestUser('error_test_user');
      
      // Try to start non-existent world
      await expect(
        worldService.startWorld(user.id, 'non-existent-world')
      ).rejects.toThrow();

      // Try to start same world twice
      const world = await WorldTestHelpers.createTestWorld();
      await worldService.startWorld(user.id, world.id);
      await expect(
        worldService.startWorld(user.id, world.id)
      ).rejects.toThrow();
    });

    it('should handle invalid quest operations', async () => {
      const { user, world, quest } = await WorldTestHelpers.setupTestEnvironment();

      // Try to complete non-existent step
      await expect(
        questService.completeQuestStep({
          questId: quest.id,
          stepId: 'non-existent-step',
          userId: user.id,
          command: 'git init'
        })
      ).rejects.toThrow();

      // Try to check completion for non-existent quest
      await expect(
        questService.checkQuestCompletion('non-existent-quest', user.id)
      ).rejects.toThrow();
    });
  });

  describe('Mock Configuration', () => {
    it('should respect mock delay settings', async () => {
      // Disable delays for this test
      TestUtils.configureMocks({ enableDelay: false });

      const startTime = Date.now();
      await TestUtils.createTestUser('speed_test_user');
      const endTime = Date.now();

      // Without delays, operations should be very fast
      expect(endTime - startTime).toBeLessThan(100);

      // Re-enable delays for other tests
      TestUtils.configureMocks({ enableDelay: true });
    });

    it('should maintain data persistence within a test', async () => {
      const { user, world } = await WorldTestHelpers.setupTestEnvironment();

      // Verify world exists in subsequent calls
      const progress = await worldService.getUserWorldProgress(user.id, world.id);
      expect(progress).toBeDefined();
      expect(progress!.worldId).toBe(world.id);

      // Data should be cleared between tests by beforeEach hook
    });
  });
});