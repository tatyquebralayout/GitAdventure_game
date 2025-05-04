import { useState } from 'react';
import { useGitRepository } from '../../contexts/GitRepositoryContext';
import { useGitRepo } from '../../hooks/useGitRepo';
import './TerminalSimulator.css';

export default function TerminalSimulator() {
  const [commandHistory, setCommandHistory] = useState<Array<{ text: string; isOutput: boolean }>>([
    { text: "Welcome to Git Adventure Terminal", isOutput: true },
    { text: "Type 'git status' to get started", isOutput: true }
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Use both Git repository contexts
  const gitRepo = useGitRepository();
  const gitRepoContext = useGitRepo();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCommand(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentCommand.trim()) {
      // Add the command to history
      const commandText = currentCommand.trim();
      setCommandHistory([...commandHistory, { text: `$ ${commandText}`, isOutput: false }]);
      setCurrentCommand("");
      setIsProcessing(true);
      
      try {
        // Execute in both contexts to keep them in sync
        await gitRepoContext.executeCommand(commandText);
        const result = await gitRepo.executeCommand(commandText);
        
        // Add result to command history (using the original context for backward compatibility)
        setCommandHistory(prev => [
          ...prev, 
          { 
            text: result.message,
            isOutput: true
          }
        ]);
      } catch (error) {
        // Handle any errors
        setCommandHistory(prev => [
          ...prev, 
          { 
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
            isOutput: true
          }
        ]);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="terminal-simulator card">
      <div className="terminal-header">
        <h3>simulador de terminal</h3>
      </div>
      <div className="terminal-window">
        <div className="terminal-output">
          {commandHistory.map((entry, index) => (
            <div 
              key={index} 
              className={`terminal-line ${entry.isOutput ? 'terminal-output-line' : 'terminal-command-line'}`}
            >
              {entry.text}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="terminal-input-line">
          <span className="terminal-prompt">$</span>
          <input
            type="text"
            value={currentCommand}
            onChange={handleInputChange}
            className="terminal-input"
            placeholder={isProcessing ? "Processing..." : "Digite um comando..."}
            autoFocus
            disabled={isProcessing}
          />
        </form>
      </div>
    </div>
  );
}