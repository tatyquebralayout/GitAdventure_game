import { GameState } from '../../stores/gameStore';
import { CommandResult } from '../../types/commands';

// Interface para funções de comando Git
export interface GitCommandHandler {
  (args: string[], state: GameState): Promise<CommandResult>;
}

// Comandos Git implementados
/* eslint-disable @typescript-eslint/no-unused-vars */
export const gitCommandHandlers: Record<string, GitCommandHandler> = {
  // Initialize a git repository
  init: async (_args, _state) => {
    return {
      success: true,
      message: 'Initialized empty Git repository in .git/',
      effects: {
        setFlag: {
          'git_initialized': true
        }
      }
    };
  },

  // Show repository status
  status: async (_args, _state) => {
    // A implementação real virá do hook useGitRepository
    return {
      success: true,
      message: 'On branch main\nNothing to commit, working tree clean'
    };
  },

  // Stage changes
  add: async (args, _state) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'Nothing specified, nothing added.'
      };
    }

    // Versão simplificada
    const files = args.join(', ');
    const message = args[0] === '.' 
      ? 'Added all changes to staging area'
      : `Added changes: ${files} to staging area`;

    return {
      success: true,
      message,
      effects: {
        setFlag: {
          'staged_changes': true
        }
      }
    };
  },

  // Commit changes
  commit: async (args, _state) => {
    if (args.indexOf('-m') === -1) {
      return {
        success: false,
        message: 'Please provide a commit message with -m'
      };
    }

    const messageIndex = args.indexOf('-m') + 1;
    
    if (messageIndex >= args.length) {
      return {
        success: false,
        message: 'Please provide a commit message after -m'
      };
    }

    const commitMessage = args[messageIndex];

    return {
      success: true,
      message: `[main (root-commit)] ${commitMessage}`,
      effects: {
        setFlag: {
          'created_commit': true
        }
      }
    };
  },

  // Create branch
  branch: async (args, _state) => {
    if (args.length === 0) {
      // Listar branches (isso seria buscado do estado do repositório)
      return {
        success: true,
        message: '* main'
      };
    }

    // Criar novo branch
    const branchName = args[0];
    
    return {
      success: true,
      message: `Created branch: ${branchName}`,
      effects: {
        setFlag: {
          'created_branch': true
        }
      }
    };
  },

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

  // Show commit history
  log: async (_args, _state) => {
    // Exemplo simplificado de log
    return {
      success: true,
      message: 'commit abc1234 (HEAD -> main)\nAuthor: Jogador <player@gitadventure.com>\nDate: ' + 
        new Date().toISOString() + '\n\n    Commit inicial\n'
    };
  },

  // Show commit differences
  diff: async (_args, _state) => {
    return {
      success: true,
      message: 'diff --git a/README.md b/README.md\nindex 1234567..abcdefg 100644\n' +
        '--- a/README.md\n+++ b/README.md\n@@ -1 +1,2 @@\n # Projeto Git Adventure\n+Nova linha adicionada'
    };
  },

  // Merge branches
  merge: async (args, _state) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'error: deve especificar uma branch para merge'
      };
    }

    const branchName = args[0];
    return {
      success: true,
      message: `Merging branch '${branchName}' into main`,
      effects: { 
        setFlag: { 
          'merged_branch': true 
        }
      }
    };
  },

  // Remote repositories
  remote: async (args, _state) => {
    if (args.length === 0) {
      return {
        success: true,
        message: 'origin'
      };
    }

    if (args[0] === 'add' && args.length >= 3) {
      const remoteName = args[1];
      const remoteUrl = args[2];
      return {
        success: true,
        message: `Remote '${remoteName}' adicionado (${remoteUrl})`,
        effects: { 
          setFlag: { 
            'added_remote': true 
          }
        }
      };
    }

    return {
      success: false,
      message: 'Uso: git remote add <name> <url>'
    };
  },

  // Push changes
  push: async (args, _state) => {
    let remoteName = 'origin';
    let branchName = 'main';
    
    if (args.length >= 2) {
      remoteName = args[0];
      branchName = args[1];
    }

    return {
      success: true,
      message: `Pushing to ${remoteName}/${branchName}...\nEverything up-to-date`,
      effects: { 
        setFlag: { 
          'pushed_changes': true 
        }
      }
    };
  },

  // Pull changes
  pull: async (args, _state) => {
    let remoteName = 'origin';
    let branchName = 'main';
    
    if (args.length >= 2) {
      remoteName = args[0];
      branchName = args[1];
    }

    return {
      success: true,
      message: `Pulling from ${remoteName}/${branchName}...\nAlready up-to-date`,
      effects: { 
        setFlag: { 
          'pulled_changes': true 
        }
      }
    };
  },

  // Clone repository
  clone: async (args, _state) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'Você deve especificar uma URL para clonar'
      };
    }

    const repoUrl = args[0];
    return {
      success: true,
      message: `Cloning into '${repoUrl.split('/').pop()?.replace('.git', '')}'...\nComplete.`,
      effects: { 
        setFlag: { 
          'cloned_repo': true 
        }
      }
    };
  },

  // Fetch changes from remote
  fetch: async (args, _state) => {
    let remoteName = 'origin';
    
    if (args.length >= 1) {
      remoteName = args[0];
    }

    return {
      success: true,
      message: `From ${remoteName}\n* branch            main       -> FETCH_HEAD`,
      effects: { 
        setFlag: { 
          'fetched_changes': true 
        }
      }
    };
  },

  // Stash changes
  stash: async (args, _state) => {
    // Verificar se é um comando "stash list", "stash pop", "stash apply" ou apenas "stash"
    if (args.length >= 1) {
      const subCommand = args[0];
      
      if (subCommand === 'list') {
        return {
          success: true,
          message: 'stash@{0}: WIP on main: abc1234 último commit\nstash@{1}: WIP on feature: def5678 alterações anteriores'
        };
      }
      
      if (subCommand === 'pop') {
        return {
          success: true,
          message: 'On branch main\nChanges not staged for commit:\n  modified: README.md\nDropped refs/stash@{0}',
          effects: { 
            setFlag: { 
              'stashed_changes': false 
            }
          }
        };
      }
      
      if (subCommand === 'apply') {
        return {
          success: true,
          message: 'On branch main\nChanges not staged for commit:\n  modified: README.md'
        };
      }

      if (subCommand === 'drop') {
        return {
          success: true,
          message: 'Dropped refs/stash@{0}'
        };
      }

      if (subCommand === 'clear') {
        return {
          success: true,
          message: 'Cleared all stashes'
        };
      }
    }
    
    // Comando stash padrão
    return {
      success: true,
      message: 'Saved working directory and index state WIP on main: abc1234 último commit',
      effects: { 
        setFlag: { 
          'stashed_changes': true 
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
  },

  // Revert changes
  revert: async (args, _state) => {
    if (args.length === 0) {
      return {
        success: false,
        message: 'error: você deve especificar um commit para reverter'
      };
    }
    
    const commitHash = args[0];
    
    return {
      success: true,
      message: `[main abc1234] Revert "${commitHash}"\n1 file changed, 1 insertion(+), 1 deletion(-)`,
      effects: { 
        setFlag: { 
          'reverted_commit': true 
        }
      }
    };
  }
};
/* eslint-enable @typescript-eslint/no-unused-vars */

// Função para processar comandos Git
export const processGitCommand = async (commandLine: string, state: GameState): Promise<CommandResult> => {
  const parts = commandLine.split(' ').filter(p => p.trim() !== '');
  
  // Verificar se é comando git
  if (parts[0] !== 'git') {
    return {
      success: false,
      message: 'Not a git command'
    };
  }

  const subCommand = parts[1] || '';
  const args = parts.slice(2);

  // Verificar se o comando existe
  if (!gitCommandHandlers[subCommand]) {
    return {
      success: false,
      message: `git: '${subCommand}' não é um comando git. Veja 'git --help'.`
    };
  }

  // Executar o comando
  return await gitCommandHandlers[subCommand](args, state);
};