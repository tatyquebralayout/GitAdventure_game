import { useEffect, useState } from 'react';
import '../styles/GamePage.css';

// Importação dos componentes necessários
import TerminalSimulator from '../components/terminal/TerminalSimulator/TerminalSimulator';
import GitSimulator from '../components/game/GitSimulator/GitSimulator';
import WorldCard from '../components/game/WorldCard/WorldCard';
import ProgressCard from '../components/game/ProgressCard/ProgressCard';
import DialogCard from '../components/game/DialogCard/DialogCard';

export default function GamePage() {
  const [showIntegrationInfo, setShowIntegrationInfo] = useState(false);
  
  useEffect(() => {
    document.title = 'Git Adventure - Simulador';
  }, []);

  return (
    <div className="game-page-container">
      {/* Botão de informações sobre integração */}
      <div className="integration-info-button" onClick={() => setShowIntegrationInfo(!showIntegrationInfo)}>
        {showIntegrationInfo ? "Esconder Informações" : "Mostrar Informações de Integração"}
      </div>
      
      {/* Popup de informações de integração */}
      {showIntegrationInfo && (
        <div className="integration-info-popup">
          <h2>Integrações entre Componentes e Backend</h2>
          
          <div className="integration-item">
            <h3>1. WorldCard</h3>
            <p>API: <code>worldApi.getAllWorlds()</code>, <code>questApi.getWorldQuests()</code></p>
            <p>Mostra mundos disponíveis e missões obtidas do backend.</p>
          </div>
          
          <div className="integration-item">
            <h3>2. ProgressCard</h3>
            <p>API: <code>progressApi.getProgress()</code></p>
            <p>Exibe o progresso real do jogador armazenado no backend.</p>
          </div>
          
          <div className="integration-item">
            <h3>3. DialogCard</h3>
            <p>API: <code>questApi.getQuestNarratives()</code></p>
            <p>Mostra diálogos dinâmicos baseados no estado da missão atual.</p>
          </div>
          
          <div className="integration-item">
            <h3>4. GitSimulator</h3>
            <p>API: <code>commandApi.executeGitCommand()</code></p>
            <p>Simulador de Git que persiste o estado do repositório no backend.</p>
          </div>
          
          <div className="integration-item">
            <h3>5. TerminalSimulator</h3>
            <p>API: <code>commandApi.executeCommand()</code>, <code>questApi.completeQuestStep()</code></p>
            <p>Processa comandos e verifica se completam etapas da missão.</p>
          </div>
          
          <button className="close-info-button" onClick={() => setShowIntegrationInfo(false)}>
            Fechar
          </button>
        </div>
      )}
      
      <div className="game-area">
        {/* Seção de diálogo no topo */}
        <div className="game-dialog-section">
          <div className="game-component-container dialog-container">
            <DialogCard />
          </div>
        </div>
        
        {/* Layout em duas colunas para o conteúdo principal */}
        <div className="game-content-section">
          {/* Coluna da esquerda - Worldbuilding e Progresso */}
          <div className="game-left-column">
            <div className="game-component-container worldcard-container">
              <WorldCard />
            </div>
            <div className="game-component-container progress-container">
              <ProgressCard />
            </div>
          </div>
          
          {/* Coluna da direita - Simuladores */}
          <div className="game-right-column">
            <div className="game-component-container git-simulator-container">
              <GitSimulator />
            </div>
            <div className="game-component-container terminal-container">
              <TerminalSimulator />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 