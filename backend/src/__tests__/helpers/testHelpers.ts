import { TestUtils } from '../setup';
import { SERVICE_TOKENS } from '../../config/services';
import { IQuestService } from '../../services/interfaces/IQuestService';
import { IWorldService } from '../../services/interfaces/IWorldService';
import { World } from '../../entities/World';
import { Quest } from '../../entities/Quest';
import { QuestCommandStep } from '../../entities/QuestCommandStep';
import { WorldDifficulty, ModuleTheme } from '../../../../shared/types/enums';

export const QuestTestHelpers = {
  /**
   * Create a test quest with steps
   */
  async createTestQuest(props?: Partial<Quest>): Promise<Quest> {
    const questService = TestUtils.getMockService<IQuestService>(SERVICE_TOKENS.QUEST_SERVICE);
    const defaultQuest: Partial<Quest> = {
      name: 'Test Quest',
      description: 'A test quest',
      type: 'tutorial',
      ...props
    };

    const quest = await questService.getQuestById('test-quest');
    return quest!;
  },

  /**
   * Start a quest for a test user
   */
  async startTestQuest(userId: string, worldId: string): Promise<Quest> {
    const questService = TestUtils.getMockService<IQuestService>(SERVICE_TOKENS.QUEST_SERVICE);
    const quest = await this.createTestQuest();
    await questService.startQuest(userId, quest.id, worldId);
    return quest;
  },

  /**
   * Complete a quest step
   */
  async completeQuestStep(
    userId: string,
    questId: string,
    stepId: string,
    command: string
  ) {
    const questService = TestUtils.getMockService<IQuestService>(SERVICE_TOKENS.QUEST_SERVICE);
    return questService.completeQuestStep(questId, stepId, userId, command);
  }
};

export const WorldTestHelpers = {
  /**
   * Create a test world
   */
  async createTestWorld(props?: Partial<World>): Promise<World> {
    const worldService = TestUtils.getMockService<IWorldService>(SERVICE_TOKENS.WORLD_SERVICE);
    const defaultWorld: Partial<World> = {
      name: 'Test World',
      description: 'A test world',
      difficulty: WorldDifficulty.BEGINNER,
      theme: ModuleTheme.GIT_BASICS,
      ...props
    };

    const worlds = await worldService.getAllWorlds({
      theme: defaultWorld.theme,
      difficulty: defaultWorld.difficulty
    });
    return worlds[0];
  },

  /**
   * Start a world for a test user
   */
  async startTestWorld(userId: string): Promise<World> {
    const worldService = TestUtils.getMockService<IWorldService>(SERVICE_TOKENS.WORLD_SERVICE);
    const world = await this.createTestWorld();
    await worldService.startWorld(userId, world.id);
    return world;
  },

  /**
   * Set up a complete test environment with a user, world, and quest
   */
  async setupTestEnvironment() {
    const { user, accessToken } = await TestUtils.createTestUser();
    const world = await this.startTestWorld(user.id);
    const quest = await QuestTestHelpers.startTestQuest(user.id, world.id);

    return {
      user,
      accessToken,
      world,
      quest
    };
  }
};