import { useState } from 'react';
import './TerminalSimulator.css';

export default function TerminalSimulator() {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCommand(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCommand.trim()) {
      setCommandHistory([...commandHistory, `$ ${currentCommand}`]);
      // Aqui você poderia adicionar lógica para processar comandos
      // e adicionar respostas ao histórico
      setCurrentCommand("");
    }
  };

  return (
    <div className="terminal-simulator card">
      <div className="terminal-header">
        <h3>simulador de terminal</h3>
      </div>
      <div className="terminal-window">
        <div className="terminal-output">
          {commandHistory.length > 0 ? (
            commandHistory.map((cmd, index) => (
              <div key={index} className="terminal-line">
                {cmd}
              </div>
            ))
          ) : (
            <div className="terminal-welcome">
              Digite um comando para começar...
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="terminal-input-line">
          <span className="terminal-prompt">$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={handleInputChange}
            className="terminal-input"
            placeholder="Digite um comando..."
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}