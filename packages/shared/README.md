# Shared Types - GitAdventure

Tipos TypeScript compartilhados entre frontend e backend.

## Estrutura

- `types/` — Tipos globais, enums, interfaces, etc.

## Formas de Importação

### Recomendada (via alias)
```ts
import { ApiResponse, ModuleTheme } from '@shared/types';
```

### Alternativa (via pacote)
```ts
import { ApiResponse } from '@gitadventure/shared/types/api';
import { ModuleTheme } from '@gitadventure/shared/types/enums';
```

> **Importante**: Prefira sempre usar o método recomendado (`@shared/types`) para garantir consistência no projeto. 