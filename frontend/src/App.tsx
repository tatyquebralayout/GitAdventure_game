// Entry point for the application layout
import './App.css';

// Import necessary components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import DialogCard from './components/DialogCard/DialogCard';
import WorldCard from './components/WorldCard/WorldCard';
import ProgressCard from './components/ProgressCard/ProgressCard';
import GitSimulator from './components/GitSimulator/GitSimulator';
import TerminalSimulator from './components/TerminalSimulator/TerminalSimulator';
import { GitRepositoryProvider } from './contexts/GitRepositoryContext';
import { GitRepoProvider } from './contexts/GitRepoContext';

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
                <DialogCard />
              </div>
              
              <div className="worldbuilding-area">
                <WorldCard />
              </div>
              
              <div className="progress-area">
                <ProgressCard />
              </div>
            </div>
            
            <div className="right-column">
              <div className="git-simulator-area">
                <GitSimulator />
              </div>
              
              <div className="terminal-simulator-area">
                <TerminalSimulator />
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