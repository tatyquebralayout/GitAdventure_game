// Entry point for the backend server
// This file will bootstrap the server (Express/NestJS)

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import commandRoutes from './routes/commandRoutes';

dotenv.config();

const app = express();

// Middleware setup
app.use(express.json());
app.use(cors());

// Routes setup
app.use('/api/commands', commandRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});