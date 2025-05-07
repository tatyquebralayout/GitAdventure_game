# Backend - GitAdventure

API RESTful construída com Express.js, TypeScript e TypeORM.

## Estrutura

- `src/controllers/` — Controllers das rotas
- `src/routes/` — Rotas da API
- `src/services/` — Lógica de negócio
- `src/entities/` — Entidades do banco
- `src/middlewares/` — Middlewares Express
- `src/__tests__/` — Testes automatizados

## Scripts

```bash
pnpm dev      # Inicia o backend em modo desenvolvimento
pnpm build    # Compila o backend
pnpm test     # Executa os testes automatizados
```

## Exemplo de importação de tipo compartilhado

```ts
import { ApiResponse } from '@gitadventure/shared/types/api';
``` 