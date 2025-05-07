# GitAdventure Monorepo

Monorepo TypeScript moderno para o projeto GitAdventure, que ensina Git de forma gamificada.

## Estrutura

```
packages/
  backend/    # API Node.js/Express, com mocks prontos para integração
  frontend/   # Frontend React + Vite, integração fácil com backend mock
  shared/     # Tipos TypeScript compartilhados
docs/         # Documentação de arquitetura e API
```

## Scripts principais

- `pnpm run dev:backend` — Sobe o backend em modo mock
- `pnpm run dev:frontend` — Sobe o frontend (em desenvolvimento)
- `pnpm run dev` — Sobe ambos em paralelo
- `pnpm run build` — Builda ambos
- `pnpm run lint` — Lint em todo o monorepo
- `pnpm run type-check` — Checagem de tipos global
- `pnpm run check:duplicates` — Busca arquivos duplicados
- `pnpm run check:unused` — Busca arquivos não utilizados

## Desenvolvimento

- **Backend**: Totalmente mockável, pronto para integração com frontend em desenvolvimento.
- **Frontend**: Consome endpoints mockados, facilitando testes e evolução incremental.
- **Tipos compartilhados**: Use `@shared/types` para importar tipos comuns.

## Documentação

- **docs/architecture.md**: Arquitetura, decisões de design, fluxo de desenvolvimento.
- **docs/api.md**: Endpoints disponíveis, exemplos de request/response, status de mocks.

## Contribuição

- Siga o padrão de commits e mantenha a documentação sempre atualizada.
- Use os scripts de lint, type-check e limpeza antes de abrir PRs.

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
