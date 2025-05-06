import { CommandResult } from './index';

// Interface para o estado do jogo
interface GameState {
  flags?: Record<string, boolean>;
}

// Interface para funções de comando Git
export interface GitCommandHandler {
  (args: string[], state: GameState): Promise<CommandResult>;
}

// Comandos Git implementados
export const gitCommandHandlers: Record<string, GitCommandHandler> = {
  // Checkout branch
  checkout: async (args, _state) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'Please specify a branch name'
      };
    }

    const isBranchCreation = args[0] === '-b';
    const branchName = isBranchCreation ? args[1] : args[0];

    if (!branchName) {
      return {
        success: false,
        message: 'Branch name not specified'
      };
    }

    if (isBranchCreation) {
      return {
        success: true,
        message: `Switched to a new branch '${branchName}'`,
        effects: {
          setFlag: {
            'created_branch': true,
            'checkout_branch': true
          }
        }
      };
    }

    return {
      success: true,
      message: `Switched to branch '${branchName}'`,
      effects: {
        setFlag: {
          'checkout_branch': true,
          'created_branch': false
        }
      }
    };
  },

  // Reset changes
  reset: async (args, _state) => {
    // Verificar as opções: --hard, --soft, ou arquivo específico
    let resetType = '';
    let target = 'HEAD';
    
    if (args.length >= 1) {
      if (args[0] === '--hard') {
        resetType = 'hard';
        if (args.length >= 2) {
          target = args[1];
        }
      } else if (args[0] === '--soft') {
        resetType = 'soft';
        if (args.length >= 2) {
          target = args[1];
        }
      } else {
        // Caso seja um arquivo específico ou outro target
        target = args[0];
      }
    }
    
    if (resetType === 'hard') {
      return {
        success: true,
        message: `HEAD is now at ${target.substring(0, 7)} commit message`,
        effects: { 
          setFlag: { 
            'reset_hard': true,
            'reset_soft': false,
            'reset_changes': false
          }
        }
      };
    } else if (resetType === 'soft') {
      return {
        success: true,
        message: `Soft reset to ${target}`,
        effects: { 
          setFlag: { 
            'reset_soft': true,
            'reset_hard': false,
            'reset_changes': false
          }
        }
      };
    } else {
      // Reset para arquivo ou staging area
      return {
        success: true,
        message: 'Unstaged changes after reset:',
        effects: { 
          setFlag: { 
            'reset_changes': true,
            'reset_hard': false,
            'reset_soft': false
          }
        }
      };
    }
  }
}; 