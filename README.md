# GitAdventure Monorepo

GitAdventure é uma aplicação interativa para aprender Git de forma gamificada, agora organizada em um monorepo moderno!

## Estrutura do Projeto

```
GitAdventurev2/
├── packages/
│   ├── frontend/   # Aplicação React (Vite, TypeScript)
│   │   └── src/
│   ├── backend/    # API Express (TypeScript, TypeORM)
│   │   └── src/
│   └── shared/     # Tipos TypeScript compartilhados
│       └── types/
├── scripts/        # Scripts utilitários
├── docs/           # Documentação
├── .gitignore
├── package.json    # Gerenciamento de workspaces
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

## Tecnologias
- **Frontend:** React 18, Vite, TypeScript
- **Backend:** Express.js, TypeScript, TypeORM, PostgreSQL
- **Compartilhado:** Tipos TypeScript em `packages/shared/types`
- **Testes:** Jest (backend), Vitest (frontend)
- **Gerenciador de pacotes:** pnpm (workspaces)

## Como rodar o projeto

### Pré-requisitos
- Node.js >= 16
- pnpm >= 8
- PostgreSQL (para o backend)

### Instalação
1. Clone o repositório:
   ```bash
   git clone <url-do-repo>
   cd GitAdventurev2
   ```
2. Instale as dependências:
   ```bash
   pnpm install
   ```

### Configuração do Banco de Dados
- Crie um arquivo `.env` em `packages/backend/` com as variáveis de conexão do PostgreSQL.
- Exemplo:
  ```env
  DB_HOST=localhost
  DB_PORT=5432
  DB_USERNAME=seu_usuario
  DB_PASSWORD=sua_senha
  DB_DATABASE=gitadventure
  ```

### Rodando em modo desenvolvimento
- **Backend:**
  ```bash
  pnpm --filter @gitadventure/backend dev
  ```
- **Frontend:**
  ```bash
  pnpm --filter @gitadventure/frontend dev
  ```
- Ou rode ambos em paralelo (em dois terminais):
  ```bash
  pnpm dev
  ```

### Build de produção
```bash
pnpm build
```

### Rodando os testes
- **Backend:**
  ```bash
  pnpm --filter @gitadventure/backend test
  ```
- **Frontend:**
  ```bash
  pnpm --filter @gitadventure/frontend test
  ```

## Estrutura dos Pacotes

### Frontend (`packages/frontend`)
- `src/pages/` — Páginas principais
- `src/api/` — Serviços de API
- `src/services/` — Serviços e comandos do jogo
- `src/hooks/` — Hooks customizados
- `src/types/` — Tipos específicos do frontend

### Backend (`packages/backend`)
- `src/controllers/` — Controllers das rotas
- `src/routes/` — Rotas da API
- `src/services/` — Lógica de negócio
- `src/entities/` — Entidades do banco
- `src/middlewares/` — Middlewares Express
- `src/__tests__/` — Testes automatizados

### Shared (`packages/shared`)
- `types/` — Tipos TypeScript compartilhados entre frontend e backend

## Contribuindo
1. Crie uma branch a partir da `main`.
2. Faça suas alterações.
3. Rode os testes e o linter.
4. Abra um Pull Request.

## Dicas
- Use os paths do `tsconfig.base.json` para importar tipos e módulos entre pacotes:
  ```ts
  import { ApiResponse } from '@gitadventure/shared/types/api';
  import { QuestService } from '@gitadventure/backend/src/services/QuestService';
  ```
- Sempre rode `pnpm install` após alterar dependências em qualquer pacote.

## Licença
MIT
