import { World } from '../../entities/World';
import { Quest } from '../../entities/Quest';
import { WorldQuest } from '../../entities/WorldQuest';
import { QuestFactory } from './QuestFactory';
import { WorldDifficulty, WorldStatus, ModuleTheme } from '../../../../shared/types/enums';
import { faker } from '@faker-js/faker';

export class WorldFactory {
    static create(override: Partial<World> = {}): World {
        const world = new World();
        world.id = faker.string.uuid();
        world.name = override.name || faker.helpers.arrayElement([
            'Git Fundamentals',
            'Branching Master',
            'Remote Repository Explorer',
            'Advanced Git Techniques',
            'Git Collaboration Pro'
        ]);
        world.description = override.description || faker.lorem.paragraph();
        world.slug = override.slug || faker.helpers.slugify(world.name).toLowerCase();
        world.difficulty = override.difficulty || faker.helpers.arrayElement(Object.values(WorldDifficulty));
        world.status = override.status || WorldStatus.PUBLISHED;
        world.worldQuests = override.worldQuests || [];
        world.playerWorlds = override.playerWorlds || [];
        
        return Object.assign(world, override);
    }

    static createWithQuests(questCount: number = 5): { world: World; quests: Quest[]; worldQuests: WorldQuest[] } {
        const world = this.create();
        const themes = Object.values(ModuleTheme);
        
        // Criar quests com progressão temática
        const quests = QuestFactory.createSequential(questCount, themes[faker.number.int({ min: 0, max: themes.length - 1 })]);
        
        // Criar WorldQuests com ordem progressiva
        const worldQuests = quests.map((quest, index) => {
            const worldQuest = new WorldQuest();
            worldQuest.worldId = world.id;
            worldQuest.questId = quest.id;
            worldQuest.displayOrder = index + 1;
            worldQuest.world = world;
            worldQuest.quest = quest;
            return worldQuest;
        });

        world.worldQuests = worldQuests;
        return { world, quests, worldQuests };
    }

    static createWorldSequence(): World[] {
        return Object.values(WorldDifficulty).map(difficulty => 
            this.create({
                difficulty,
                status: WorldStatus.PUBLISHED,
                name: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} World`
            })
        );
    }
}