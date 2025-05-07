export const messages = {
  auth: {
    invalidCredentials: 'Credenciais inválidas',
    userExists: 'Usuário ou e-mail já existe',
    unauthorized: 'Usuário não autenticado',
    invalidToken: 'Token inválido',
    logoutSuccess: 'Logout realizado com sucesso',
    loginSuccess: 'Login realizado com sucesso',
    registerSuccess: 'Usuário cadastrado com sucesso',
    requiredFields: {
      username: 'Nome de usuário é obrigatório',
      password: 'Senha é obrigatória',
      email: 'E-mail é obrigatório'
    }
  },
  progress: {
    saveSuccess: 'Progresso salvo com sucesso',
    loadSuccess: 'Progresso carregado com sucesso',
    deleteSuccess: 'Save excluído com sucesso',
    listSuccess: 'Saves listados com sucesso',
    notFound: 'Save não encontrado',
    invalidData: 'Dados incompletos. saveSlot, saveName e gameState são obrigatórios'
  },
  quest: {
    stepComplete: 'Passo completado com sucesso',
    questComplete: 'Quest completada com sucesso',
    notFound: 'Quest não encontrada',
    alreadyStarted: 'Quest já foi iniciada',
    invalidStep: 'Passo inválido'
  },
  git: {
    commands: {
      init: {
        success: 'Repositório Git inicializado com sucesso!',
        error: 'Erro ao inicializar repositório Git'
      },
      add: {
        success: 'Arquivos adicionados com sucesso!',
        error: 'Erro ao adicionar arquivos'
      },
      commit: {
        success: 'Alterações commitadas com sucesso!',
        error: 'Erro ao commitar alterações'
      },
      branch: {
        success: 'Branch criado com sucesso!',
        error: 'Erro ao criar branch'
      },
      checkout: {
        success: 'Mudou para o branch com sucesso!',
        error: 'Erro ao mudar de branch'
      }
    }
  },
  errors: {
    internal: 'Erro interno do servidor',
    notFound: 'Recurso não encontrado',
    validation: 'Erro de validação',
    database: 'Erro no banco de dados'
  }
};