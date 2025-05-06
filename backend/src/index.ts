// Entry point for the backend server
import 'reflect-metadata'; // Necessário para TypeORM
import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/database';
import { commandRoutes } from './routes/commandRoutes';
import { authRoutes } from './routes/authRoutes';
import { worldRoutes } from './routes/worldRoutes';
import { questRoutes } from './routes/questRoutes';
import { progressRoutes } from './routes/progressRoutes';
import { errorMiddleware } from './middlewares/errorMiddleware';

// Carregar variáveis de ambiente
dotenv.config();

// Verificar se está em modo de produção
if (process.env.NODE_ENV === 'production') {
  console.error('Production mode is disabled. Please run in development mode only.');
  process.exit(1);
}

// Inicializar o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Restrict to local development only
  credentials: true
}));
app.use(express.json());

// Mensagem apenas para desenvolvimento
app.use((req, res, next) => {
  console.log('Development mode only - Not for production use');
  next();
});

// Rotas da API
app.use('/api/commands', commandRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', worldRoutes);
app.use('/api', questRoutes);
app.use('/api/progress', progressRoutes);

// Rota raiz para verificação da API
app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'GitAdventure API - Development Mode Only' 
  });
});

// Middleware de erro global (deve ser o último middleware)
app.use(errorMiddleware as ErrorRequestHandler);

// Inicializar conexão com o banco de dados e iniciar o servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Development database connection established');
    
    app.listen(PORT, () => {
      console.log(`Development server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to development database:', error);
    process.exit(1);
  });