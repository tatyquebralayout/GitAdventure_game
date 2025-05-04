import { useState, useRef, useEffect } from 'react';
import { useGitRepository } from '@frontend/contexts/GitRepositoryContext';
import { useGitRepo } from '@frontend/hooks/useGitRepo';
import { useGame } from '@frontend/hooks/useGame';
import { processCommand } from '@frontend/services/commands';
import { GameState } from '@frontend/stores/gameStore';
import './TerminalSimulator.css';

export default function TerminalSimulator() {
  const [commandHistory, setCommandHistory] = useState<Array<{ text: string; isOutput: boolean }>>([
    { text: "Welcome to Git Adventure Terminal", isOutput: true },
    { text: "Type 'help' to see available commands", isOutput: true }
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Use Git repository contexts for Git commands
  const gitRepo = useGitRepository();
  const gitRepoContext = useGitRepo();
  
  // Use game context for adventure commands
  const gameState = useGame();
  
  // Auto-scroll terminal output to bottom when new content is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCommand(e.target.value);
  };

  // Helper function to build the complete game state from useGame hook
  const buildGameState = (): GameState => {
    // Build gameFlags by checking known flags
    const gameFlags: Record<string, boolean> = {
      'cave_illuminated': gameState.hasFlag('cave_illuminated'),
      'basic_training_complete': gameState.hasFlag('basic_training_complete'),
      'created_branch': gameState.hasFlag('created_branch'),
      'bridge_fixed': gameState.hasFlag('bridge_fixed'),
      'puzzle_solved': gameState.hasFlag('puzzle_solved')
    };
    
    // Get visited locations
    const visitedLocations = ['start']; // Always include start
    
    // Add other locations if visited
    ['forest', 'village', 'cave', 'mountain'].forEach(loc => {
      if (gameState.hasVisited(loc)) {
        visitedLocations.push(loc);
      }
    });
    
    return {
      currentLocation: gameState.location,
      inventory: gameState.inventory,
      visitedLocations,
      gameFlags
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentCommand.trim()) {
      // Add the command to history
      const commandText = currentCommand.trim();
      setCommandHistory(prev => [...prev, { text: `$ ${commandText}`, isOutput: false }]);
      setCurrentCommand("");
      setIsProcessing(true);
      
      // Check if it's a Git command
      if (commandText.startsWith('git ')) {
        try {
          // Execute Git command in both contexts to keep them in sync
          await gitRepoContext.executeCommand(commandText);
          const result = await gitRepo.executeCommand(commandText);
          
          // Add result to command history
          setCommandHistory(prev => [
            ...prev, 
            { 
              text: result.message,
              isOutput: true
            }
          ]);
        } catch (error) {
          // Handle Git command errors
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
      } else {
        // Process adventure command with our new pattern matching system
        try {
          // Get the complete current state from the game store
          const currentState = buildGameState();
          
          // Process the command
          const result = processCommand(commandText, currentState);
          
          // Apply command effects if successful
          if (result.success && result.effects) {
            if (result.effects.setLocation) {
              gameState.move(result.effects.setLocation);
            }
            
            if (result.effects.addToInventory?.length) {
              for (const item of result.effects.addToInventory) {
                gameState.pickupItem(item);
              }
            }
            
            if (result.effects.setFlag) {
              for (const [flag, value] of Object.entries(result.effects.setFlag)) {
                gameState.setFlag(flag, value);
              }
            }
          }
          
          // Add result to command history
          setCommandHistory(prev => [
            ...prev,
            {
              text: result.message,
              isOutput: true
            }
          ]);
        } catch (error) {
          // Handle adventure command errors
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
    }
  };

  return (
    <div className="terminal-simulator card">
      <div className="terminal-header">
        <h3>simulador de terminal</h3>
      </div>
      <div className="terminal-window">
        <div className="terminal-output" ref={outputRef}>
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