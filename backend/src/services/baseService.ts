export abstract class BaseService {
  protected get useMocks(): boolean {
    return process.env.USE_MOCKS === 'true';
  }
  
  protected async getDataOrMock<T>(
    dbFn: () => Promise<T>,
    mockFn: () => T,
    logError = true
  ): Promise<T> {
    // Se estiver no modo mock, nem tenta acessar banco
    if (this.useMocks) {
      return mockFn();
    }
    
    try {
      return await dbFn();
    } catch (error) {
      if (logError) {
        console.error('Erro ao buscar dados:', error);
      }
      return mockFn();
    }
  }
}