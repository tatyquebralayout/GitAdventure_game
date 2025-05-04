// Entry point for the backend server
import 'reflect-metadata'; // Necessário para TypeORM
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { AppDataSource } from './config/database';
import commandRoutes from './routes/commandRoutes';
import authRoutes from './routes/authRoutes';
import questRoutes from './routes/questRoutes';
import progressRoutes from './routes/progressRoutes';

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar conexão com banco de dados e iniciar o servidor
AppDataSource.initialize()
  .then(() => {
    console.log('Conexão com banco de dados estabelecida com sucesso');
    
    const app = express();
    
    // Middleware setup
    app.use(express.json());
    app.use(cors());
    
    // Routes setup
    app.use('/api/commands', commandRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/quests', questRoutes);
    app.use('/api/progress', progressRoutes);
    
    // Rota raiz para verificação da API
    app.get('/', (req, res) => {
      res.json({ 
        success: true, 
        message: 'GitAdventure API está funcionando!' 
      });
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Erro ao conectar ao banco de dados:', error);
    
    // Iniciar servidor mesmo sem banco de dados (modo de fallback)
    console.log('Iniciando servidor em modo de fallback (sem persistência de dados)');
    
    const app = express();
    
    // Middleware setup
    app.use(express.json());
    app.use(cors());
    
    // Routes setup (apenas rotas que podem funcionar sem banco de dados)
    app.use('/api/commands', commandRoutes);
    app.use('/api/quests', questRoutes);
    app.use('/api/progress', progressRoutes);
    
    // Rota raiz para verificação da API
    app.get('/', (req, res) => {
      res.json({ 
        success: true, 
        message: 'GitAdventure API está funcionando em modo de fallback!' 
      });
    });
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT} em modo de fallback`);
    });
  });