# Arquitetura do Monorepo GitAdventure

## Visão Geral

O projeto GitAdventure é organizado como um monorepo TypeScript moderno, facilitando o desenvolvimento incremental, integração entre frontend e backend, e centralização de tipos compartilhados.

## Estrutura de Pastas

```
packages/
  backend/    # API Node.js/Express, com mocks prontos para integração
  frontend/   # Frontend React + Vite, integração fácil com backend mock
  shared/     # Tipos TypeScript compartilhados
scripts/      # Scripts utilitários de limpeza e automação
docs/         # Documentação de arquitetura e API
```

## Princípios de Arquitetura

- **Monorepo**: Um único repositório para frontend, backend e tipos compartilhados.
- **Mocks**: O backend pode rodar totalmente em modo mock, facilitando o desenvolvimento do frontend e testes de integração.
- **Tipos compartilhados**: Todos os tipos comuns ficam em `packages/shared/types`, importados via alias `@shared/types`.
- **Automação**: Scripts para encontrar duplicidades, resíduos e arquivos não utilizados.
- **Configuração centralizada**: ESLint, tsconfig e scripts padronizados para todo o monorepo.

## Fluxo de Desenvolvimento

1. **Desenvolvimento isolado**: Frontend e backend podem ser desenvolvidos e testados separadamente.
2. **Integração fácil**: O frontend consome endpoints mockados do backend, garantindo previsibilidade.
3. **Evolução incremental**: Endpoints e serviços podem ser migrados de mock para real sem quebrar o fluxo do time.
4. **Testes e lint**: Scripts globais para lint, type-check e testes garantem qualidade contínua.

## Boas Práticas

- Sempre documente endpoints e fluxos mockados em `docs/api.md`.
- Use tipos compartilhados para evitar duplicidade e bugs de tipagem.
- Antes de abrir PRs, rode lint, type-check e scripts de limpeza.
- Mantenha o README e a documentação sempre atualizados.

## Como migrar de mock para produção

1. Implemente o serviço real no backend.
2. Troque a instância mock pela real no controller correspondente.
3. Atualize a documentação e exemplos de resposta.
4. Teste a integração com o frontend.

---

Para detalhes de endpoints e exemplos de uso, veja `docs/api.md`.

## System Architecture

The application follows a client-server architecture:

```
┌─────────────────┐          ┌─────────────────┐          ┌──────────────┐
│                 │  HTTP/   │                 │   SQL    │              │
│    Frontend     │◄────────►│    Backend      │◄─────────►│  PostgreSQL  │
│ (React, Zustand)│   JSON   │ (Express, TypeORM)│          │   Database   │
│                 │          │                 │          │              │
└─────────────────┘          └─────────────────┘          └──────────────┘
```

## Monorepo Structure

The project utilizes a monorepo structure managed by `pnpm workspaces`. This allows for shared configurations (like `tsconfig.base.json`) and dependencies, promoting consistency across the different packages (`frontend`, `backend`, `shared`).

- **`backend/`**: Contains the Express.js server code.
- **`frontend/`**: Contains the React client application code.
- **`shared/`**: Contains code and types shared between the frontend and backend, such as API response structures and core domain types (e.g., `World`, `PlayerWorld`). This eliminates duplication and ensures type consistency.
- **`docs/`**: Contains project documentation.
- **Root**: Configuration files for the entire monorepo (pnpm, TypeScript, ESLint).

## Frontend Architecture

The frontend is built with React 19, TypeScript, Vite, and Zustand, structured for maintainability and modularity:

### Key Components

- **App.tsx**: The main application component that defines the overall layout
- **Components/**
  - **DialogCard**: Displays narrative content and instructions
  - **WorldCard**: Shows available missions and worlds
  - **ProgressCard**: Tracks user progress
  - **GitSimulator**: Visual representation of Git repository state
  - **TerminalSimulator**: Interactive terminal for executing Git commands
  - **GitGraph**: Component for visualizing Git history using GitGraph.js
  - **Header/Footer**: Basic layout components

### State Management

The frontend uses Zustand (`stores/gameStore.ts`) for global state management, handling aspects like:
- Current game location
- Player inventory
- Quest status and progress
- Game flags and events

Components typically access and update the state via the `useGameStore` hook (or similar, depending on implementation in `gameStore.ts`).

### Visualization Approaches

The application offers two visualization approaches for Git repositories:

1. **GitGraph.js**: Interactive visualization using the GitGraph library
2. **Mermaid**: Text-based diagram representation with Mermaid syntax

Users can toggle between these visualizations to understand Git concepts from different perspectives.

## Backend Architecture

The backend is built with Express.js, TypeScript, and TypeORM, following a layered architecture:

### Layers

```
┌─────────────────┐
│    Routes       │  Define API endpoints (Express Router)
└────────┬────────┘
         │
┌────────▼────────┐
│  Controllers    │  Handle HTTP request/response logic, DTO validation
└────────┬────────┘
         │
┌────────▼────────┐
│   Services      │  Implement business logic
└────────┬────────┘
         │
┌────────▼────────┐
│    Entities     │  Define data structure (TypeORM Entities)
└────────┬────────┘
         │
┌────────▼────────┐
│    Database     │  Data persistence (PostgreSQL via TypeORM)
└─────────────────┘
```

### Key Components

- **Controllers**: `AuthController`, `CommandController`, `QuestController`, `GameProgressController`
- **Services**: `CommandValidationService`, `QuestService` (and potentially others for Auth, Progress)
- **Entities**: `User`, `Quest`, `QuestCommandStep`, `GameProgress`, `UserProgress` (TypeORM entities)
- **Config**: `database.ts` (TypeORM DataSource configuration)
- **Middleware**: `authMiddleware.ts` (JWT authentication)

### Error Handling

The backend employs a centralized error handling strategy:

- **`AppError` (`utils/AppError.ts`)**: A custom error class extending `Error`, allowing for specific HTTP status codes and optional details to be attached to errors.
- **`errorMiddleware` (`middlewares/errorMiddleware.ts`)**: An Express middleware function registered *after* all routes. It catches errors passed via `next(error)`, logs them, and formats a standardized JSON response (`ApiResponse`) based on whether the error is an `AppError` or an unexpected internal error.
- **Controllers**: Controllers use `try...catch` blocks. Specific, known errors (like 'Not Found') are thrown as `AppError` instances. All caught errors are passed to the `errorMiddleware` using `next(error)`.

## Data Flow

1. User interacts with the frontend (e.g., enters a command, completes a quest step).
2. Frontend state (Zustand) is updated optimistically or triggers an API call.
3. API request is sent to the Backend (Express).
4. Backend route is matched, middleware (e.g., auth) is executed.
5. Controller handles the request, potentially validating input (DTOs).
6. Service layer executes the core business logic.
7. TypeORM entities/repositories interact with the PostgreSQL database for data persistence or retrieval.
8. Response is sent back through the layers to the frontend.
9. Frontend updates its state (Zustand) and UI based on the API response.
10. Visualizations (GitGraph, Mermaid) are updated based on the new state.

## Future Considerations

1. **Expanded Quest System**: Develop more complex learning paths and challenges.
2. **Refined Command Validation**: Improve the flexibility and feedback of command validation.
3. **Enhanced Visualizations**: Add more interactive elements or different visualization types.
4. **Testing**: Increase test coverage for both frontend and backend.
5. **Collaboration Features**: Explore possibilities for team-based learning or interaction.
6. **Deployment Strategy**: Define clear steps for deploying to production environments.