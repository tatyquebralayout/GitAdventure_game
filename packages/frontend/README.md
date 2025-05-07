# Frontend - GitAdventure

Aplicação React + Vite + TypeScript.

## Estrutura

- `src/pages/` — Páginas principais
- `src/api/` — Serviços de API
- `src/services/` — Serviços e comandos do jogo
- `src/hooks/` — Hooks customizados
- `src/types/` — Tipos específicos do frontend

## Scripts

```bash
pnpm dev      # Inicia o frontend em modo desenvolvimento
pnpm build    # Compila o frontend
pnpm test     # Executa os testes automatizados
```

## Exemplo de importação de tipo compartilhado

```ts
import { ApiResponse } from '@gitadventure/shared/types/api';
``` 