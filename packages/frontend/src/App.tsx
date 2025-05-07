import React from 'react';
import DialogCard from './components/DialogCard';
import WorldCard from './components/WorldCard';
import ProgressCard from './components/ProgressCard';
import GitSimulator from './components/GitSimulator';
import TerminalSimulator from './components/TerminalSimulator';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="main-layout" style={{ minHeight: '100vh', background: '#eee' }}>
      {/* Header */}
      <header className="header" style={{ padding: 8, background: '#ccc', marginBottom: 8 }}>
        header para menu com admin, login, e outros
      </header>

      {/* Conteúdo principal em grid */}
      <div className="content" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr', gridTemplateRows: 'auto auto auto', gap: 12 }}>
        {/* Linha 1 */}
        <div style={{ gridColumn: '1/2', gridRow: '1/2' }}>
          <DialogCard />
        </div>
        <div style={{ gridColumn: '2/3', gridRow: '1/2' }}>
          <GitSimulator />
        </div>

        {/* Linha 2 */}
        <div style={{ gridColumn: '1/2', gridRow: '2/3' }}>
          <WorldCard />
        </div>
        <div style={{ gridColumn: '2/3', gridRow: '2/3' }}>
          <TerminalSimulator />
        </div>

        {/* Linha 3 */}
        <div style={{ gridColumn: '1/2', gridRow: '3/4' }}>
          <ProgressCard />
        </div>
        {/* Espaço vazio à direita na linha 3 */}
      </div>

      {/* Footer */}
      <footer className="footer" style={{ padding: 8, background: '#ccc', marginTop: 8 }}>
        rodapé
      </footer>
    </div>
  );
};

export default App;