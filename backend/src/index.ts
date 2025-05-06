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

// Inicializar o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
    message: 'GitAdventure API está funcionando!' 
  });
});

// Middleware de erro global (deve ser o último middleware)
app.use(errorMiddleware as ErrorRequestHandler);

// Inicializar conexão com o banco de dados e iniciar o servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida');
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
    
    // Iniciar servidor mesmo sem banco de dados (modo de fallback)
    console.log('Iniciando servidor em modo de fallback (sem persistência de dados)');
    
    // A configuração do app (middleware, rotas) já foi feita antes.
    // Apenas iniciamos o servidor.
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} em modo de fallback`);
    });
  });