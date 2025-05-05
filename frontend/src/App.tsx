// Entry point for the application layout
import './App.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import necessary components
import Header from './components/ui/Header/Header';
import Footer from './components/ui/Footer/Footer';
import { GitRepositoryProvider } from './contexts/GitRepositoryProvider';
import { GitRepoProvider } from './contexts/GitRepoContext';

// Lazy load pages
const WorldsPage = lazy(() => import('./pages/WorldsPage'));
const QuestPage = lazy(() => import('./pages/QuestPage'));
const PlayerProgressPage = lazy(() => import('./pages/PlayerProgressPage'));
const GamePage = lazy(() => import('./pages/GamePage'));

// Loading fallback component
const LoadingPlaceholder = () => (
  <div className="loading-placeholder">
    Carregando...
  </div>
);

// Define the main App with routing
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <div className="header">
          <Header />
        </div>
        
        <GitRepositoryProvider>
          <GitRepoProvider>
            <Suspense fallback={<LoadingPlaceholder />}>
              <Routes>
                {/* Página inicial redireciona para mundos */}
                <Route path="/" element={<Navigate to="/worlds" replace />} />
                
                {/* Páginas principais */}
                <Route path="/worlds" element={<WorldsPage />} />
                <Route path="/quests/:questId" element={<QuestPage />} />
                <Route path="/progress" element={<PlayerProgressPage />} />
                
                {/* Nova página de jogo integrada */}
                <Route path="/game" element={<GamePage />} />
                
                {/* Layout de simulador completo para quests ativas */}
                <Route path="/simulator/:worldId/:questId" element={<GamePage />} />
                
                {/* Rota para teste */}
                <Route path="/test" element={<div className="p-8 text-center">Página de teste funcionando!</div>} />
                
                {/* Rota de fallback para páginas não encontradas */}
                <Route path="*" element={
                  <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">Página não encontrada</h1>
                      <p className="mb-8">A página que você está procurando não existe.</p>
                      <a 
                        href="/"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Voltar para o início
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
          </GitRepoProvider>
        </GitRepositoryProvider>
        
        <div className="footer">
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}
