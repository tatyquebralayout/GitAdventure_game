import { Module } from '../../entities/Module';
import { ModuleTheme } from '@shared/types';
import { faker } from '@faker-js/faker';

export class ModuleFactory {
    static create(override: Partial<Module> = {}): Module {
        const module = new Module();
        module.id = faker.string.uuid();
        module.name = override.name || faker.helpers.arrayElement([
            'Git Basics - Introduction',
            'Branching and Merging',
            'Remote Repository Operations',
            'Advanced Git Features',
            'Git Workflow Best Practices'
        ]);
        module.description = override.description || faker.lorem.paragraph();
        module.theme = override.theme || faker.helpers.arrayElement(Object.values(ModuleTheme));
        module.order = override.order || faker.number.int({ min: 0, max: 100 });
        module.prerequisites = override.prerequisites || [];
        module.questModules = override.questModules || [];
        
        return Object.assign(module, override);
    }

    static createMany(count: number, override: Partial<Module> = {}): Module[] {
        return Array.from({ length: count }, () => this.create(override));
    }

    static createSequential(count: number, themeOrder: ModuleTheme[]): Module[] {
        return Array.from({ length: count }, (_, index) => {
            const theme = themeOrder[Math.floor(index / (count / themeOrder.length))];
            return this.create({
                order: index,
                theme,
                prerequisites: index > 0 ? [faker.string.uuid()] : []
            });
        });
    }
}