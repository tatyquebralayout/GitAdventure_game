// Entry point for the application layout
import './App.css';
import { lazy, Suspense } from 'react';

// Import necessary components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import { GitRepositoryProvider } from './contexts/GitRepositoryContext';
import { GitRepoProvider } from './contexts/GitRepoContext';

// Lazy load heavier components that are not immediately needed
const DialogCard = lazy(() => import('./components/DialogCard/DialogCard'));
const WorldCard = lazy(() => import('./components/WorldCard/WorldCard'));
const ProgressCard = lazy(() => import('./components/ProgressCard/ProgressCard'));
const GitSimulator = lazy(() => import('./components/GitSimulator/GitSimulator'));
const TerminalSimulator = lazy(() => import('./components/TerminalSimulator/TerminalSimulator'));

// Loading fallback component
const LoadingPlaceholder = () => (
  <div className="loading-placeholder">
    Carregando...
  </div>
);

// Define the grid layout for the application
export default function App() {
  return (
    <div className="app-container">
      <div className="header">
        <Header />
      </div>
      
      <GitRepositoryProvider>
        <GitRepoProvider>
          <div className="content-grid">
            <div className="left-column">
              <div className="dialog-area">
                <Suspense fallback={<LoadingPlaceholder />}>
                  <DialogCard />
                </Suspense>
              </div>
              
              <div className="worldbuilding-area">
                <Suspense fallback={<LoadingPlaceholder />}>
                  <WorldCard />
                </Suspense>
              </div>
              
              <div className="progress-area">
                <Suspense fallback={<LoadingPlaceholder />}>
                  <ProgressCard />
                </Suspense>
              </div>
            </div>
            
            <div className="right-column">
              <div className="git-simulator-area">
                <Suspense fallback={<LoadingPlaceholder />}>
                  <GitSimulator />
                </Suspense>
              </div>
              
              <div className="terminal-simulator-area">
                <Suspense fallback={<LoadingPlaceholder />}>
                  <TerminalSimulator />
                </Suspense>
              </div>
            </div>
          </div>
        </GitRepoProvider>
      </GitRepositoryProvider>
      
      <div className="footer">
        <Footer />
      </div>
    </div>
  );
}