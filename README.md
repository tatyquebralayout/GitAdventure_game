# GitAdventure

GitAdventure é uma aplicação interativa projetada para ensinar conceitos de Git através de uma experiência de aprendizado gamificada. Os usuários podem aprender comandos e conceitos do Git completando missões em uma interface visual envolvente com feedback em tempo real e visualização.

## Visão Geral do Projeto

GitAdventure combina um terminal interativo, representação visual do repositório Git e um sistema de missões para tornar o aprendizado do Git intuitivo e divertido. A aplicação fornece feedback imediato sobre comandos Git e mostra visualmente o que está acontecendo nos bastidores.

## Arquitetura

Este projeto é construído como um monorepo usando pnpm workspaces com:

- **Frontend**: React 18, TypeScript, Vite, Zustand e Tailwind CSS
- **Backend**: Express.js com TypeScript, TypeORM e PostgreSQL
- **Visualização**: GitGraph.js e Mermaid para visualização de repositórios Git

## Estrutura do Projeto

```
GitAdventure/
├── frontend/               # Aplicação frontend React
│   ├── src/
│   │   ├── api/            # Handlers de serviço API
│   │   ├── assets/         # Ativos estáticos
│   │   ├── components/     # Componentes UI reutilizáveis
│   │   │   ├── game/             # Componentes de jogo
│   │   │   ├── terminal/         # Componentes de terminal
│   │   │   └── ui/               # Componentes UI básicos
│   │   ├── contexts/       # Contextos React para gerenciamento de estado
│   │   ├── hooks/          # Hooks React personalizados
│   │   ├── pages/          # Componentes de nível de página
│   │   ├── services/       # Serviços do lado do cliente
│   │   ├── stores/         # Gerenciamento de estado
│   │   ├── styles/         # Estilos globais
│   │   ├── types/          # Definições de tipo TypeScript
│   │   └── utils/          # Funções utilitárias
│   │
│   ├── package.json        # Dependências do frontend
│   └── tsconfig.json       # Configuração TypeScript
│
├── backend/                # Backend Express.js
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Manipuladores de requisições
│   │   ├── dtos/           # Objetos de transferência de dados
│   │   ├── entities/       # Entidades de banco de dados
│   │   ├── middlewares/    # Funções middleware personalizadas
│   │   ├── models/         # Modelos de dados
│   │   ├── repositories/   # Camada de acesso a dados
│   │   ├── routes/         # Definições de rotas API
│   │   ├── services/       # Lógica de negócios
│   │   └── utils/          # Funções utilitárias
│   │
│   ├── package.json        # Dependências do backend
│   └── tsconfig.json       # Configuração TypeScript
│
├── docs/                   # Documentação
├── dist/                   # Arquivos de build
├── public/                 # Arquivos públicos estáticos
├── tests/                  # Arquivos de teste
├── eslint.config.js        # Configuração ESLint
├── package.json            # package.json raiz
├── pnpm-workspace.yaml     # Configuração do workspace pnpm
├── tsconfig.base.json      # Configuração TypeScript base
└── tsconfig.json           # Configuração TypeScript raiz
```

## Principais Recursos

- **Terminal Interativo**: Uma interface de terminal simulada para executar comandos Git
- **Visualização de Repositório Git**: Representação visual de repositórios Git usando GitGraph e diagramas Mermaid
- **Aprendizado Baseado em Missões**: Missões estruturadas para aprender conceitos Git passo a passo
- **Acompanhamento de Progresso**: Acompanhe seu progresso de aprendizado Git
- **Validação de Comandos**: Validação de backend de comandos Git contra padrões esperados para cada etapa de aprendizado
- **Múltiplas Opções de Visualização**: Alterne entre diferentes abordagens de visualização Git

## Começando

### Pré-requisitos

- Node.js (>= 16.x)
- pnpm (>= 8.x)
- Servidor de Banco de Dados PostgreSQL

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seuusuario/GitAdventure.git
   cd GitAdventure
   ```

2. Instale as dependências usando pnpm:
   ```bash
   pnpm install
   ```

3. Configure a conexão do banco de dados do backend:
   - Crie um arquivo `.env` no diretório `backend/`.
   - Adicione as variáveis de ambiente necessárias para sua conexão com o banco de dados PostgreSQL (veja `backend/src/config/database.ts` para detalhes, ex: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`).

### Executando a Aplicação

1. Inicie o servidor backend:
   ```bash
   pnpm dev:backend
   ```

2. Em um terminal separado, inicie o frontend:
   ```bash
   pnpm dev:frontend
   ```

3. Abra seu navegador e navegue até `http://localhost:5173` (ou a URL mostrada em seu terminal).

## Desenvolvimento

### Desenvolvimento Frontend

O frontend é construído com React 18, TypeScript e Vite. Recursos principais incluem:

- **Arquitetura baseada em componentes**: Componentes UI modulares
- **Context API**: Para gerenciamento de estado
- **Tailwind CSS**: Para estilização
- **Múltiplas bibliotecas de visualização**: @gitgraph/react e Mermaid para visualização de gráficos Git

### Desenvolvimento Backend

O backend é construído com Express.js e TypeScript. Ele fornece:

- **API RESTful**: Para validação de comandos, progressão de missões, autenticação, etc.
- **Arquitetura baseada em serviços**: Separação de preocupações com controllers, services e routes.
- **Integração com Banco de Dados**: Usa TypeORM para interagir com um banco de dados PostgreSQL.

## Construindo para Produção

1. Construa a aplicação inteira:
   ```bash
   pnpm build
   ```

2. Ou construa pacotes específicos:
   ```bash
   pnpm build:frontend
   pnpm build:backend
   ```

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para enviar um Pull Request.

## Licença

Este projeto está licenciado sob a Licença MIT.
