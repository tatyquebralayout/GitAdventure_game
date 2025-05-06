# Backend GitAdventure

API backend para o GitAdventure, um jogo educativo para aprender Git.

## Configuração

### Configuração do Ambiente

1. Crie um arquivo `.env` na raiz do diretório `backend/` com o seguinte conteúdo:

```
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=gitadventure

# Segurança
JWT_SECRET=sua_chave_secreta_muito_segura
JWT_EXPIRES_IN=7d

# Configurações do TypeORM
TYPEORM_SYNCHRONIZE=true
TYPEORM_LOGGING=true
```

### Instalação do PostgreSQL

1. Baixe e instale o PostgreSQL a partir do [site oficial](https://www.postgresql.org/download/).
2. Durante a instalação, defina uma senha para o usuário `postgres`.
3. Após a instalação, crie um banco de dados chamado `gitadventure`:
   - Use o pgAdmin que vem com o PostgreSQL ou
   - Execute o comando SQL no terminal: `CREATE DATABASE gitadventure;`

### Instalação de Dependências

```bash
pnpm install
```

### Execução de Migrações

Para criar e executar migrações de banco de dados:

```bash
# Gerar uma migração (substitua NOME_DA_MIGRACAO pelo nome desejado)
pnpm migration:generate NOME_DA_MIGRACAO

# Executar migrações pendentes
pnpm migration:run

# Reverter a última migração aplicada
pnpm migration:revert
```

## Execução

### Ambiente de Desenvolvimento

```bash
pnpm dev
```

### Produção

```bash
pnpm build
pnpm start
```

## API Endpoints

### Autenticação

- `POST /api/auth/register` - Registrar um novo usuário
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/logout` - Logout de usuário
- `GET /api/auth/profile` - Obter perfil do usuário autenticado (requer autenticação)

### Quests

- `GET /api/quests` - Listar todas as quests disponíveis
- `GET /api/quests/:id` - Obter detalhes de uma quest específica
- `GET /api/quests/user/progress` - Obter progresso do usuário em todas as quests (requer autenticação)
- `GET /api/quests/user/progress/:questId` - Obter progresso do usuário em uma quest específica (requer autenticação)
- `POST /api/quests/start` - Iniciar uma nova quest (requer autenticação)
- `GET /api/quests/:questId/steps` - Obter os passos de uma quest (requer autenticação)

### Comandos

- `POST /api/commands/validate` - Validar um comando Git (requer autenticação)

### Progresso do Jogo

- `POST /api/progress/save` - Salvar progresso do jogo (requer autenticação)
- `GET /api/progress/load/:saveSlot` - Carregar progresso salvo (requer autenticação)
- `GET /api/progress/list` - Listar todos os saves disponíveis (requer autenticação)
- `DELETE /api/progress/delete/:saveSlot` - Excluir um save (requer autenticação) 