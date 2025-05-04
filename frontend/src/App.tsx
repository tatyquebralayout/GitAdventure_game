import './App.css';

// Import necessary components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import DialogCard from './components/DialogCard/DialogCard';
import WorldCard from './components/WorldCard/WorldCard';
import ProgressCard from './components/ProgressCard/ProgressCard';
import GitSimulator from './components/GitSimulator/GitSimulator';
import TerminalSimulator from './components/TerminalSimulator/TerminalSimulator';

// Define the grid layout for the application
export default function App() {
  return (
    <div className="app-grid">
      <Header />
      <main>
        <section className="dialog-section">
          <DialogCard />
        </section>
        <section className="world-section">
          <WorldCard />
        </section>
        <section className="progress-section">
          <ProgressCard />
        </section>
        <section className="simulator-section">
          <div className="simulator-git">
            <GitSimulator />
          </div>
          <div className="simulator-terminal">
            <TerminalSimulator />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}