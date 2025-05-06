import { useState, useRef, useEffect } from 'react';
import { useGitRepository } from '../../../hooks/useGitRepository';
import { useGame } from '../../../hooks/useGame';
import { useCommandHistory } from '../../../hooks/useCommandHistory';
import { processCommand } from '../../../services/commands';
import { processGitCommand } from '../../../services/commands/gitCommands';
import { processShellCommand } from '../../../services/commands/shellCommands';
import { autocompleteCommand } from '../../../services/commands/autocomplete';
// Correct import path for CommandEffect
import { CommandEffect } from '../../../types/commands'; 
import { GameState } from '../../../stores/gameStore';
import DevTip from '../../ui/DevHelper/DevTip';
import './TerminalSimulator.css';

export default function TerminalSimulator() {
  const [commandHistory, setCommandHistory] = useState<Array<{ text: string; isOutput: boolean }>>([
    { text: "Bem-vindo ao Terminal do Git Adventure", isOutput: true },
    { text: "Digite 'help' para ver comandos disponíveis ou 'git --help' para comandos Git", isOutput: true }
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  
  // Use Git repository contexts for Git commands
  const gitRepo = useGitRepository();
  
  // Use game context for adventure commands
  const gameState = useGame();
  
  // Use command history hook
  const { addToHistory, navigateHistory } = useCommandHistory();
  
  // Auto-scroll terminal output to bottom when new content is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commandHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCommand(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const previousCommand = navigateHistory('up');
      if (previousCommand !== null) {
        setCurrentCommand(previousCommand);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextCommand = navigateHistory('down');
      if (nextCommand !== null) {
        setCurrentCommand(nextCommand);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (currentCommand.trim()) {
        const completed = autocompleteCommand(currentCommand.trim());
        if (completed) {
          setCurrentCommand(completed);
        }
      }
    }
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

  const executeGitCommand = async (commandText: string) => {
    try {
      // Execute Git command using the single context
      const result = await gitRepo.executeCommand(commandText);
      
      // Process for game effects using our own handler
      const gameState = buildGameState();
      const gitResult = await processGitCommand(commandText, gameState);
      
      // Apply effects if successful
      if (gitResult.success && gitResult.effects) {
        applyEffectsToGameState(gitResult.effects);
      }
      
      // Add result to command history
      setCommandHistory(prev => [
        ...prev, 
        { 
          text: result.message || gitResult.message, // Use message from the hook result
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const commandText = currentCommand.trim();
    if (!commandText) return;
    
    // Add the command to history
    setCommandHistory(prev => [...prev, { text: `$ ${commandText}`, isOutput: false }]);
    setCurrentCommand("");
    setIsProcessing(true);
    
    // Add to command history for navigation
    addToHistory(commandText);
    
    try {
      // Determine command type (Git, Shell, or Adventure)
      if (commandText.startsWith('git ')) {
        await executeGitCommand(commandText);
      } else if (isShellCommand(commandText)) {
        // Process Shell command
        const shellResult = processShellCommand(commandText);
        
        // Update visual Git state if needed
        if (shellResult.success) {
          // Commands that might affect GitSimulator
          if (commandText.startsWith('cd ') || 
              commandText.startsWith('mkdir ') || 
              commandText.startsWith('touch ') || 
              commandText.startsWith('rm ')) {
            await gitRepo.executeCommand('git status');
          }
        }
        
        // Add result to history
        setCommandHistory(prev => [
          ...prev,
          {
            text: shellResult.message || '',
            isOutput: true
          }
        ]);
      } else {
        // Process adventure command with our pattern matching system
        // Get the complete current state from the game store
        const gameState = buildGameState();
        
        // Process the command
        const result = processCommand(commandText, gameState);
        
        // Apply command effects if successful
        if (result.success && result.effects) {
          applyEffectsToGameState(result.effects);
        }
        
        // Add result to command history
        setCommandHistory(prev => [
          ...prev,
          {
            text: result.message,
            isOutput: true
          }
        ]);
      }
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
  };

  // Helper function to check if command is a shell command
  const isShellCommand = (command: string): boolean => {
    const shellCommands = [
      'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cat', 
      'echo', 'clear', 'man', 'help', 'grep', 'find', 'diff',
      'less', 'more', 'head', 'tail', 'vimdiff'
    ];
    
    const commandName = command.split(' ')[0];
    return shellCommands.includes(commandName);
  };

  // Helper function to apply effects to game state
  const applyEffectsToGameState = (effects: CommandEffect) => {
    if (effects.setLocation) {
      gameState.move(effects.setLocation);
    }
    
    if (effects.addToInventory?.length) {
      for (const item of effects.addToInventory) {
        gameState.pickupItem(item);
      }
    }
    
    if (effects.removeFromInventory?.length) {
      for (const item of effects.removeFromInventory) {
        gameState.removeItem(item);
      }
    }
    
    if (effects.setFlag) {
      for (const [flag, value] of Object.entries(effects.setFlag)) {
        // Ensure value is boolean before passing to setFlag
        if (typeof value === 'boolean') {
          gameState.setFlag(flag, value);
        } else {
          // Handle cases where value might not be boolean (e.g., log error)
          console.warn(`Invalid type for flag '${flag}': expected boolean, got ${typeof value}`);
        }
        
        // Atualizar visualização do Git quando relevante using the single context
        if (
            flag === 'created_commit' || 
            flag === 'created_branch' || 
            flag === 'merged_branch' || 
            flag === 'added_remote' || 
            flag === 'pushed_changes' || 
            flag === 'pulled_changes' || 
            flag === 'cloned_repo' ||
            flag === 'fetched_changes' ||
            flag === 'stashed_changes' ||
            flag === 'reset_hard' ||
            flag === 'reset_soft' ||
            flag === 'reset_changes' ||
            flag === 'reverted_commit'
          ) {
          // Recarregar estado do git para atualizar a visualização
          gitRepo.executeCommand('git status');
        }
      }
    }
  };

  return (
    <DevTip
      componentName="TerminalSimulator"
      description="Simulador de terminal para executar comandos Git e de aventura. Permite ao jogador interagir com o repositório e o mundo do jogo."
      integrationTip="Deve processar comandos Git através da API commandApi e verificar se os comandos completam etapas da missão usando questApi.completeQuestStep()."
    >
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
              onKeyDown={handleKeyDown}
              className="terminal-input"
              placeholder={isProcessing ? "Processando..." : "Digite um comando..."}
              autoFocus
              disabled={isProcessing}
            />
          </form>
        </div>
      </div>
    </DevTip>
  );
}