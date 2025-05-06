import { QuestFactory, WorldFactory, ModuleFactory } from '../mocks/factories';

export abstract class BaseService {
  protected get useMocks(): boolean {
    return process.env.USE_MOCKS === 'true';
  }

  protected async getDataOrMock<T>(
    getData: () => Promise<T | null>,
    createMock: () => T
  ): Promise<T> {
    if (this.useMocks) {
      return createMock();
    }

    try {
      const data = await getData();
      if (data) {
        return data;
      }
      return createMock();
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      return createMock();
    }
  }

  protected getFactory(type: 'quest' | 'world' | 'module') {
    switch (type) {
      case 'quest':
        return QuestFactory;
      case 'world':
        return WorldFactory;
      case 'module':
        return ModuleFactory;
      default:
        throw new Error(`Unknown factory type: ${type}`);
    }
  }
}