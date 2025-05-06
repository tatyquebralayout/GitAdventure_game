import { Quest } from '../../entities/Quest';
import { QuestCommandStep } from '../../entities/QuestCommandStep';
import { ModuleTheme } from '../../../../shared/types/enums';
import { faker } from '@faker-js/faker';

export class QuestFactory {
    static createCommandStep(questId: string, stepNumber: number, override: Partial<QuestCommandStep> = {}): QuestCommandStep {
        const commands = {
            init: {
                name: 'git init',
                regex: '^git init$',
                pattern: 'git init',
                description: 'Initialize a git repository'
            },
            add: {
                name: 'git add',
                regex: '^git add (\\.|[\\w\\.\\-_]+)$',
                pattern: 'git add .',
                description: 'Add files to staging area'
            },
            commit: {
                name: 'git commit',
                regex: '^git commit -m "(.*)"$',
                pattern: 'git commit -m "message"',
                description: 'Commit changes with message'
            },
            branch: {
                name: 'git branch',
                regex: '^git branch ([\\w\\-_]+)$',
                pattern: 'git branch feature',
                description: 'Create a new branch'
            },
            checkout: {
                name: 'git checkout',
                regex: '^git checkout ([\\w\\-_]+)$',
                pattern: 'git checkout feature',
                description: 'Switch to another branch'
            },
            merge: {
                name: 'git merge',
                regex: '^git merge ([\\w\\-_]+)$',
                pattern: 'git merge feature',
                description: 'Merge a branch'
            }
        };

        const commandTypes = Object.keys(commands) as Array<keyof typeof commands>;
        const commandType = override.commandName 
            ? commandTypes.find(type => commands[type].name === override.commandName) || 'init'
            : faker.helpers.arrayElement(commandTypes);

        const command = commands[commandType];

        const step = new QuestCommandStep();
        step.id = faker.string.uuid();
        step.questId = questId;
        step.stepNumber = stepNumber;
        step.commandName = command.name;
        step.commandRegex = command.regex;
        step.description = command.description;
        step.expectedPattern = command.pattern;
        step.hint = faker.helpers.arrayElement([
            'Try checking the command syntax',
            'Make sure you\'re in the right directory',
            'Check if you need to add files first',
            null
        ]);
        step.isOptional = override.isOptional || false;
        step.successMessage = `Successfully executed ${command.name}!`;
        
        return Object.assign(step, override);
    }

    static create(override: Partial<Quest> = {}): Quest {
        const quest = new Quest();
        quest.id = faker.string.uuid();
        quest.name = override.name || faker.helpers.arrayElement([
            'Getting Started with Git',
            'Branching Basics',
            'Merging Changes',
            'Remote Repository Fundamentals',
            'Advanced Git Operations'
        ]);
        quest.description = override.description || faker.lorem.paragraph();
        quest.type = override.type || faker.helpers.arrayElement(['tutorial', 'challenge', 'practice']);
        quest.parentQuestId = override.parentQuestId || null;
        quest.commandSteps = override.commandSteps || Array.from(
            { length: faker.number.int({ min: 3, max: 7 }) },
            (_, i) => this.createCommandStep(quest.id, i + 1)
        );
        
        return Object.assign(quest, override);
    }

    static createSequential(count: number, theme: ModuleTheme): Quest[] {
        let lastQuest: Quest | null = null;
        return Array.from({ length: count }, (_, index) => {
            const quest = this.create({
                parentQuestId: lastQuest?.id || null,
                type: index === 0 ? 'tutorial' : 'challenge',
                commandSteps: this.createThematicSteps(theme, index)
            });
            lastQuest = quest;
            return quest;
        });
    }

    private static createThematicSteps(theme: ModuleTheme, difficulty: number): QuestCommandStep[] {
        const stepsCount = 3 + Math.floor(difficulty / 2);
        const steps: QuestCommandStep[] = [];
        const questId = faker.string.uuid();

        switch (theme) {
            case ModuleTheme.GIT_BASICS:
                steps.push(this.createCommandStep(questId, 1, { commandName: 'git init' }));
                steps.push(this.createCommandStep(questId, 2, { commandName: 'git add' }));
                steps.push(this.createCommandStep(questId, 3, { commandName: 'git commit' }));
                break;
            case ModuleTheme.BRANCHING:
                steps.push(this.createCommandStep(questId, 1, { commandName: 'git branch' }));
                steps.push(this.createCommandStep(questId, 2, { commandName: 'git checkout' }));
                steps.push(this.createCommandStep(questId, 3, { commandName: 'git merge' }));
                break;
            default:
                for (let i = 0; i < stepsCount; i++) {
                    steps.push(this.createCommandStep(questId, i + 1));
                }
        }

        return steps;
    }
}