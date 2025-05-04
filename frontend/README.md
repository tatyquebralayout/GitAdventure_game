# Git Adventure Frontend

## Folder Structure

The project follows a structured organization to maintain scalability and separation of concerns:

```
src/
├── components/
│   ├── ui/              # Basic UI components (Header, Footer)
│   ├── game/            # Game-specific components (WorldCard, DialogCard, ProgressCard, GitGraph, GitSimulator)
│   └── terminal/        # Terminal-related components (TerminalSimulator)
├── hooks/               # Custom React hooks (useGame, etc.)
├── stores/              # Global state management using Zustand
├── services/            # Services for complex logic
│   ├── commands/        # Command processing logic
│   └── locations/       # Location management logic
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── constants/           # Game constants and configuration
├── assets/              # Static resources
│   ├── images/          # Image files
│   └── audio/           # Audio files
└── styles/              # Global styles and themes
```

### Key Directories:

- **components/ui**: Contains reusable UI elements used throughout the application
- **components/game**: Contains game-specific components related to gameplay
- **components/terminal**: Contains components for the terminal simulator
- **hooks**: Custom React hooks for reusing stateful logic across components
- **stores**: Zustand store for centralized state management with persistence
- **services**: Contains business logic separated from UI components
- **constants**: Global constants and configuration values
- **assets**: Static files like images and audio resources

## State Management

The application uses Zustand for global state management. The main game state is managed in `stores/gameStore.ts`.

Key aspects managed by the store likely include:
- Current game location/world
- Player inventory
- Quest status and progress tracking
- Game flags or events
- Potentially Git simulation state (branches, commits)

Components typically access and manipulate the state using the hook exported by the store (e.g., `useGameStore`). Refer to `stores/gameStore.ts` and its usage (e.g., in `hooks/useGame.ts` if it exists) for specific details.