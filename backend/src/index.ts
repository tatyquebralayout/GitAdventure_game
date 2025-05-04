// Entry point for the backend server
// This file will bootstrap the server (Express/NestJS)

import express from 'express';
import dotenv from 'dotepnpm add -D @types/dotenvcdnv';

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());

// Routes setup
// Example: app.use('/api/v1', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});