# Documentação de API — GitAdventure (Modo Mock)

## Visão Geral

O backend do GitAdventure está pronto para rodar em modo mock, facilitando o desenvolvimento e testes do frontend. Todos os endpoints principais retornam respostas simuladas, com estrutura e status próximos do real.

## Endpoints Principais (Mock)

### Autenticação

- **POST /api/auth/register**
  - Request: `{ username, email, password }`
  - Response: `201 Created` + dados do usuário (sem senha)

- **POST /api/auth/login**
  - Request: `{ username, password }`
  - Response: `{ accessToken, refreshToken, user }`

- **POST /api/auth/refresh-token**
  - Request: `{ refreshToken }`
  - Response: `{ accessToken, refreshToken, user }`

- **POST /api/auth/logout**
  - Request: `{}` (usuário autenticado)
  - Response: `204 No Content`

### Progresso do Jogo

- **POST /api/saves**
  - Request: `{ saveSlot, saveName, gameState }`
  - Response: `{ success, message, progress }`

- **GET /api/saves/:saveSlot**
  - Response: `{ success, message, progress }`

- **GET /api/saves**
  - Response: `{ success, message, saves: [...] }`

- **DELETE /api/saves/:saveSlot**
  - Response: `{ success, message }`

### Quests

- **GET /api/quests/:id**
  - Response: `{ success, quest }`

- **GET /api/quests/:id/narratives**
  - Response: `{ success, narratives }`

- **GET /api/quests/:id/steps**
  - Response: `{ success, steps }`

- **POST /api/quests/:id/start**
  - Request: `{ worldId }`
  - Response: `{ success, playerQuest }`

- **POST /api/quests/:id/steps/:stepId/complete**
  - Request: `{ command }`
  - Response: `{ success, result }`

- **POST /api/quests/:id/complete**
  - Request: `{ worldId }`
  - Response: `{ success, playerQuest }`

### Comandos Git

- **POST /api/commands/validate**
  - Request: `{ command, questId, currentStep }`
  - Response: `{ success, message, details }`

## Observações

- Todos os endpoints acima retornam dados simulados, mas com estrutura idêntica ao esperado em produção.
- Erros de negócio retornam status HTTP apropriado e mensagens claras.
- Para integração, basta consumir os endpoints normalmente — não é necessário autenticação real em modo mock.

## Exemplos de Request/Response

### Exemplo: Login
```json
POST /api/auth/login
{
  "username": "test_user",
  "password": "password123"
}
// Response
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {
    "id": "...",
    "username": "test_user",
    "email": "test@example.com",
    "experience": 0,
    "level": 1,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Exemplo: Salvar Progresso
```json
POST /api/saves
{
  "saveSlot": 1,
  "saveName": "Meu Save",
  "gameState": { /* ... */ }
}
// Response
{
  "success": true,
  "message": "Progresso salvo com sucesso",
  "progress": {
    "id": "...",
    "saveSlot": 1,
    "saveName": "Meu Save",
    "updatedAt": "..."
  }
}
```

---

Para detalhes de arquitetura e fluxo de desenvolvimento, veja `docs/architecture.md`.