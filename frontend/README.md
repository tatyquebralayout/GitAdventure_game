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

The application uses Zustand for state management. The main game state is managed in `stores/gameStore.ts` and provides:

- Current location tracking
- Inventory management
- Visited locations history
- Game flags for tracking progress

Access the game state through the `useGame` hook in `hooks/useGame.ts`.