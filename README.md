# GitAdventure

GitAdventure is a full-stack application built with React, TypeScript, and Vite for the frontend, and Express.js for the backend. This project is designed to provide a modular and scalable architecture for web development.

## Project Structure

The project is organized into the following directories:

- **frontend/**: Contains the React-based frontend application.
  - **src/**: Source code for the frontend.
    - **components/**: Reusable UI components.
    - **pages/**: Page-level components.
    - **services/**: API service handlers.
    - **hooks/**: Custom React hooks.
    - **utils/**: Utility functions.
    - **styles/**: Global and component-specific styles.

- **backend/**: Contains the Express.js-based backend application.
  - **src/**: Source code for the backend.
    - **controllers/**: Request handlers.
    - **routes/**: API route definitions.
    - **services/**: Business logic.
    - **models/**: Database models.
    - **middlewares/**: Custom middleware functions.
    - **utils/**: Utility functions.

- **public/**: Static assets served by the frontend.
- **tests/**: Test files for both frontend and backend.

## Features

- **Frontend**:
  - Built with React and TypeScript.
  - Modular component structure.
  - Vite for fast development and build.

- **Backend**:
  - Built with Express.js.
  - RESTful API structure.
  - Middleware and service-based architecture.

## Getting Started

### Prerequisites

- Node.js (>= 16.x)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd GitAdventure
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Development Mode

1. Start the backend server:
   ```bash
   npm run dev:backend
   ```

2. Start the frontend application:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

#### Production Mode

1. Build the application:
   ```bash
   npm run build
   ```

2. Serve the production build:
   ```bash
   npm run preview
   ```

## Linting and Type Checking

- Run ESLint:
  ```bash
  npm run lint
  ```

- Run TypeScript type checking:
  ```bash
  npm run type-check
  ```

## Contributing

Contributions are welcome! Please follow the [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License.
