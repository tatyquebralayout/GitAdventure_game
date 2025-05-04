# GitAdventure

GitAdventure is an interactive application designed to teach Git concepts through a gamified learning experience. Users can learn Git commands and concepts by completing missions in an engaging visual interface with real-time feedback and visualization.

## Project Overview

GitAdventure combines an interactive terminal, visual Git repository representation, and a quest system to make learning Git intuitive and fun. The application provides immediate feedback on Git commands and visually shows what's happening behind the scenes.

## Architecture

This project is built as a monorepo using pnpm workspaces with:


- **Frontend**: React 19, TypeScript, Vite, Zustand, and Tailwind CSS
- **Backend**: Express.js with TypeScript, TypeORM, and PostgreSQL
- **Visualization**: GitGraph.js and Mermaid for Git repository visualization

## Project Structure

```
GitAdventure/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── api/            # API service handlers
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable UI components
│   │   │   ├── DialogCard/       # Dialog component
│   │   │   ├── Footer/           # Footer component
│   │   │   ├── GitGraph/         # Git graph visualization
│   │   │   ├── GitSimulator/     # Git simulator components
│   │   │   ├── Header/           # Header component
│   │   │   ├── ProgressCard/     # Progress tracking component
│   │   │   ├── TerminalSimulator/ # Terminal simulator
│   │   │   └── WorldCard/        # Mission/world selection
│   │   ├── contexts/       # React contexts for state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # Client-side services
│   │   ├── store/          # State management
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   │
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
│
├── backend/                # Express.js backend
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── dtos/           # Data transfer objects
│   │   ├── middlewares/    # Custom middleware functions
│   │   ├── models/         # Data models
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   │
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
│
├── docs/                   # Documentation
│   ├── api.md              # API documentation
│   └── architecture.md     # Architecture documentation
│
├── public/                 # Static public files
├── tests/                  # Test files
├── eslint.config.js        # ESLint configuration
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # pnpm workspace configuration
├── tsconfig.base.json      # Base TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Key Features

- **Interactive Terminal**: A simulated terminal interface for executing Git commands
- **Git Repository Visualization**: Visual representation of Git repositories using both GitGraph and Mermaid diagrams
- **Mission-based Learning**: Structured missions to learn Git concepts step by step
- **Progress Tracking**: Track your Git learning progress
- **Command Validation**: Backend validation of Git commands against expected patterns for each learning step
- **Multiple Visualization Options**: Toggle between different Git visualization approaches

## Getting Started

### Prerequisites

- Node.js (>= 16.x)
- pnpm (>= 8.x)
- PostgreSQL Database Server

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/GitAdventure.git
   cd GitAdventure
   ```

2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```

3. Configure the backend database connection:
   - Create a `.env` file in the `backend/` directory.
   - Add the necessary environment variables for your PostgreSQL database connection (see `backend/src/config/database.ts` for details, e.g., `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`).

### Running the Application

1. Start the backend server:
   ```bash
   pnpm --filter backend dev
   ```

2. In a separate terminal, start the frontend:
   ```bash
   pnpm --filter frontend dev
   ```

3. Open your browser and navigate to `http://localhost:5173` (or the URL shown in your terminal).

## Development

### Frontend Development

The frontend is built with React 19, TypeScript, and Vite. Key features include:

- **Component-based architecture**: Modular UI components
- **Context API**: For state management (GitRepoContext and GitRepositoryContext)
- **Tailwind CSS**: For styling
- **Multiple visualization libraries**: @gitgraph/react and Mermaid for Git graph visualization

### Backend Development

The backend is built with Express.js and TypeScript. It provides:

- **RESTful API**: For command validation, quest progression, authentication, etc.
- **Service-based architecture**: Separation of concerns with controllers, services, and routes.
- **Database Integration**: Uses TypeORM to interact with a PostgreSQL database.

## Building for Production

1. Build the entire application:
   ```bash
   pnpm build
   ```

2. Or build specific packages:
   ```bash
   pnpm --filter frontend build
   pnpm --filter backend build
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
