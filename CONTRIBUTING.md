# Contributing to GitAdventure

Thank you for considering contributing to GitAdventure! We welcome contributions from the community.

## Getting Started

1.  **Fork the repository:** Create your own fork of the GitAdventure repository on GitHub.
2.  **Clone your fork:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/GitAdventurev2.git
    cd GitAdventurev2
    ```
3.  **Install Dependencies:** This project uses `pnpm` as the package manager. Make sure you have pnpm installed (`npm install -g pnpm`). Then, install dependencies from the root directory:
    ```bash
    pnpm install
    ```

## Development Workflow

1.  **Create a Branch:** Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name  # or fix/your-bug-fix-name
    ```
2.  **Running the Project:**
    *   **Backend:**
        ```bash
        cd backend
        pnpm run dev # Starts the backend server with hot-reloading
        ```
    *   **Frontend:**
        ```bash
        cd frontend
        pnpm run dev # Starts the Vite development server for the frontend
        ```
    *   Ensure you have a PostgreSQL database set up according to the backend README or configuration (`backend/src/config/database.ts`) and environment variables (`backend/.env`).
3.  **Make Changes:** Implement your feature or fix the bug.
4.  **Coding Standards:**
    *   Follow the existing code style.
    *   Ensure your code passes linting checks (if configured, e.g., `pnpm lint`).
    *   Write clear and concise code with appropriate comments (TSDoc/JSDoc).
    *   Import types using the alias `@shared/types`.
5.  **Commit Changes:** Commit your changes with clear and descriptive commit messages.
6.  **Push Changes:** Push your branch to your fork:
    ```bash
    git push origin feature/your-feature-name
    ```
7.  **Create a Pull Request:** Open a pull request from your fork's branch to the main repository's `main` branch (or the relevant development branch).
    *   Provide a clear title and description for your pull request, explaining the changes and referencing any related issues.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on the main GitHub repository. Provide as much detail as possible, including steps to reproduce for bugs.

## Questions?

Feel free to ask questions by opening an issue.

## Coding Standards

### Importações dos Tipos Compartilhados

Para manter a consistência no código e facilitar a manutenção, sempre use o alias `@shared/types` para importar tipos compartilhados:

```typescript
// ✅ CORRETO - Use este formato
import { ModuleTheme, WorldDifficulty } from '@shared/types';

// ❌ INCORRETO - Não use caminhos relativos para shared
import { ModuleTheme } from '../../../shared/types/enums';

// ❌ INCORRETO - Não use imports diretos dos arquivos específicos
import { ModuleTheme } from '@gitadventure/shared/types/enums';
```

Temos scripts para ajudar a manter essa padronização:

```bash
# Verifica se há problemas com importações
pnpm validate-imports

# Corrige automaticamente os problemas encontrados
pnpm fix-imports
```

O CI executa a validação de importações em cada pull request.