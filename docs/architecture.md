# Architecture Documentation

## Overview

GitAdventure is an interactive Git learning platform built as a monorepo using pnpm workspaces. It consists of a React-based frontend and an Express.js backend, designed to provide an engaging, gamified learning experience for Git concepts.

## System Architecture

The application follows a client-server architecture:

```
┌─────────────────┐          ┌─────────────────┐
│                 │  HTTP/   │                 │
│    Frontend     │◄────────►│    Backend      │
│    (React)      │   JSON   │    (Express)    │
│                 │          │                 │
└─────────────────┘          └─────────────────┘
```

## Frontend Architecture

The frontend is built with React 19, TypeScript, and Vite, structured for maintainability and modularity:

### Key Components

- **App.tsx**: The main application component that defines the overall layout
- **Components/**
  - **DialogCard**: Displays narrative content and instructions
  - **WorldCard**: Shows available missions and worlds
  - **ProgressCard**: Tracks user progress
  - **GitSimulator**: Visual representation of Git repository state
  - **TerminalSimulator**: Interactive terminal for executing Git commands
  - **GitGraph**: Component for visualizing Git history using GitGraph.js
  - **Header/Footer**: Basic layout components

### Context Management

The frontend uses React Context API for state management:

- **GitRepoContext**: Manages the state of the Git repository visualization
  - Manages branches, commits, and visualization options
  - Provides methods for Git operations (commit, branch, merge)
  - Maintains Mermaid diagram representation
  
- **GitRepositoryContext**: Legacy context being replaced by GitRepoContext
  - Both contexts are currently used in parallel during transition

### Visualization Approaches

The application offers two visualization approaches for Git repositories:

1. **GitGraph.js**: Interactive visualization using the GitGraph library
2. **Mermaid**: Text-based diagram representation with Mermaid syntax

Users can toggle between these visualizations to understand Git concepts from different perspectives.

## Backend Architecture

The backend is built with Express.js and TypeScript, following a layered architecture:

### Layers

```
┌─────────────────┐
│    Routes       │  Define API endpoints and request handling
└────────┬────────┘
         │
┌────────▼────────┐
│  Controllers    │  Handle HTTP request/response logic
└────────┬────────┘
         │
┌────────▼────────┐
│   Services      │  Implement business logic
└────────┬────────┘
         │
┌────────▼────────┐
│  Repositories   │  Handle data access (currently mocked)
└─────────────────┘
```

### Key Components

- **CommandController**: Handles Git command validation requests
- **CommandValidationService**: Validates Git commands against expected patterns
- **QuestCommandStep**: Model for Git command steps in quests/tutorials

## Data Flow

1. User enters a Git command in the TerminalSimulator
2. Command is sent to the backend for validation
3. Backend validates the command against expected pattern for current step
4. Response is returned to frontend
5. If valid, the command is executed in the Git simulator 
6. Visual representation is updated in both GitGraph and Mermaid views
7. Progress is updated and feedback is provided to the user

## Future Considerations

1. **Database Integration**: Replace mock data with actual database storage
2. **User Authentication**: Add user accounts and progress persistence
3. **Additional Visualizations**: Implement more ways to visualize Git concepts
4. **Expanded Quest System**: Develop more complex learning paths and challenges
5. **Collaboration Features**: Add multiplayer/team learning capabilities