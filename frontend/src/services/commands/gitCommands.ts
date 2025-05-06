import { CommandResult, CommandEffect } from '../../types/commands';
import { GameState } from '../../stores/gameStore';

interface GitCommandHandler {
  (args: string[], gameState: GameState): Promise<CommandResult>;
}

export async function processGitCommand(command: string, gameState: GameState): Promise<CommandResult> {
  const [, ...parts] = command.split(' ');
  const subcommand = parts[0];
  const args = parts.slice(1);

  const handlers: Record<string, GitCommandHandler> = {
    init: handleInit,
    status: handleStatus,
    add: handleAdd,
    commit: handleCommit,
    branch: handleBranch,
    checkout: handleCheckout,
    log: handleLog,
    diff: handleDiff,
    merge: handleMerge,
    remote: handleRemote,
    push: handlePush,
    pull: handlePull,
    clone: handleClone,
    fetch: handleFetch,
    stash: handleStash,
    reset: handleReset,
    revert: handleRevert,
  };

  const handler = handlers[subcommand];
  
  if (!handler) {
    return {
      success: false,
      message: `Unknown git subcommand: ${subcommand}`
    };
  }

  return handler(args, gameState);
}

async function handleInit(_args: string[], gameState: GameState): Promise<CommandResult> {
  return {
    success: true,
    message: 'Initialized empty Git repository',
    effects: {
      setFlag: {
        repo_initialized: true
      }
    }
  };
}

async function handleStatus(_args: string[], gameState: GameState): Promise<CommandResult> {
  return {
    success: true,
    message: 'Your branch is up to date with \'origin/main\'.\nnothing to commit, working tree clean',
  };
}

async function handleAdd(args: string[], gameState: GameState): Promise<CommandResult> {
  if (!args.length) {
    return {
      success: false,
      message: 'Nothing specified, nothing added.'
    };
  }

  return {
    success: true,
    message: `Changes to be committed:\n  ${args.join('\n  ')}`,
    effects: {
      setFlag: {
        files_staged: true
      }
    }
  };
}

async function handleCommit(args: string[], gameState: GameState): Promise<CommandResult> {
  let message = '';
  let messageIndex = args.indexOf('-m');
  
  if (messageIndex === -1) {
    return {
      success: false,
      message: 'Please provide a commit message with -m flag'
    };
  }

  if (messageIndex + 1 < args.length) {
    message = args[messageIndex + 1];
  } else {
    return {
      success: false,
      message: 'Please provide a commit message after -m flag'
    };
  }

  return {
    success: true,
    message: `[main ${Math.random().toString(16).slice(2, 8)}] ${message}\n 1 file changed`,
    effects: {
      setFlag: {
        created_commit: true
      }
    }
  };
}

async function handleBranch(args: string[], gameState: GameState): Promise<CommandResult> {
  if (!args.length) {
    return {
      success: true,
      message: '* main'
    };
  }

  const branchName = args[0];
  return {
    success: true,
    message: `Created branch ${branchName}`,
    effects: {
      setFlag: {
        created_branch: true
      }
    }
  };
}

async function handleCheckout(args: string[], gameState: GameState): Promise<CommandResult> {
  if (!args.length) {
    return {
      success: false,
      message: 'Please specify which branch to checkout'
    };
  }

  const branchName = args[0];
  let message = `Switched to branch '${branchName}'`;
  let effects: CommandEffect = {};

  // Handle branch creation with -b flag
  if (args.includes('-b')) {
    message = `Created and switched to branch '${branchName}'`;
    effects = {
      setFlag: {
        created_branch: true
      }
    };
  }

  return {
    success: true,
    message,
    effects
  };
}

async function handleLog(_args: string[], gameState: GameState): Promise<CommandResult> {
  return {
    success: true,
    message: 'commit abc123\nAuthor: Player\nDate: Now\n\n    Initial commit'
  };
}

async function handleDiff(_args: string[], gameState: GameState): Promise<CommandResult> {
  return {
    success: true,
    message: 'diff --git a/file.txt b/file.txt\nindex abc..def\n--- a/file.txt\n+++ b/file.txt'
  };
}

async function handleMerge(args: string[], gameState: GameState): Promise<CommandResult> {
  if (!args.length) {
    return {
      success: false,
      message: 'Please specify which branch to merge'
    };
  }

  const branchName = args[0];
  return {
    success: true,
    message: `Merged branch '${branchName}' into current branch`,
    effects: {
      setFlag: {
        merged_branch: true
      }
    }
  };
}

async function handleRemote(args: string[], gameState: GameState): Promise<CommandResult> {
  if (!args.length) {
    return {
      success: true,
      message: 'origin'
    };
  }

  if (args[0] === 'add') {
    if (args.length < 3) {
      return {
        success: false,
        message: 'Please specify a name and URL for the remote'
      };
    }

    return {
      success: true,
      message: `Added remote '${args[1]}' with URL '${args[2]}'`,
      effects: {
        setFlag: {
          added_remote: true
        }
      }
    };
  }

  return {
    success: false,
    message: 'Unknown remote subcommand'
  };
}

async function handlePush(args: string[], gameState: GameState): Promise<CommandResult> {
  if (args.length < 2) {
    return {
      success: false,
      message: 'Please specify remote and branch names'
    };
  }

  return {
    success: true,
    message: `Pushed to ${args[0]}/${args[1]}`,
    effects: {
      setFlag: {
        pushed_changes: true
      }
    }
  };
}

async function handlePull(args: string[], gameState: GameState): Promise<CommandResult> {
  if (args.length < 2) {
    return {
      success: false,
      message: 'Please specify remote and branch names'
    };
  }

  return {
    success: true,
    message: `Pulled from ${args[0]}/${args[1]}`,
    effects: {
      setFlag: {
        pulled_changes: true
      }
    }
  };
}

async function handleClone(args: string[], gameState: GameState): Promise<CommandResult> {
  if (!args.length) {
    return {
      success: false,
      message: 'Please specify repository URL'
    };
  }

  const repoUrl = args[0];
  const targetDir = args[1] || repoUrl.split('/').pop()?.replace(/\.git$/, '') || 'repo';

  return {
    success: true,
    message: `Cloning into '${targetDir}'...`,
    effects: {
      setFlag: {
        cloned_repo: true
      }
    }
  };
}

async function handleFetch(_args: string[], gameState: GameState): Promise<CommandResult> {
  return {
    success: true,
    message: 'Fetching origin...',
    effects: {
      setFlag: {
        fetched_changes: true
      }
    }
  };
}

async function handleStash(args: string[], gameState: GameState): Promise<CommandResult> {
  const subCommand = args[0] || 'save';
  
  switch (subCommand) {
    case 'save':
      return {
        success: true,
        message: 'Saved working directory and index state',
        effects: {
          setFlag: {
            stashed_changes: true
          }
        }
      };
      
    case 'pop':
      return {
        success: true,
        message: 'Applied stashed changes',
        effects: {
          setFlag: {
            stashed_changes: false
          }
        }
      };
      
    case 'list':
      return {
        success: true,
        message: 'stash@{0}: WIP on main: abc123 Last commit message'
      };
      
    case 'apply':
      return {
        success: true,
        message: 'Applied stash',
        effects: {
          setFlag: {
            stashed_changes: true
          }
        }
      };
      
    case 'drop':
      return {
        success: true,
        message: 'Dropped stash'
      };
      
    case 'clear':
      return {
        success: true,
        message: 'Cleared all stashes'
      };
      
    default:
      return {
        success: false,
        message: `Unknown stash subcommand: ${subCommand}`
      };
  }
}

async function handleReset(args: string[], gameState: GameState): Promise<CommandResult> {
  let mode = 'mixed'; // Default reset mode
  let target = 'HEAD';
  
  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      switch (arg) {
        case '--soft':
          mode = 'soft';
          break;
        case '--hard':
          mode = 'hard';
          break;
        case '--mixed':
          mode = 'mixed';
          break;
      }
    } else {
      target = arg;
    }
  });
  
  let effects: CommandEffect = {};
  
  switch (mode) {
    case 'soft':
      effects = {
        setFlag: {
          reset_soft: true
        }
      };
      return {
        success: true,
        message: `Reset to ${target} (soft)`,
        effects
      };
      
    case 'hard':
      effects = {
        setFlag: {
          reset_hard: true
        }
      };
      return {
        success: true,
        message: `Reset to ${target} (hard)`,
        effects
      };
      
    default:
      effects = {
        setFlag: {
          reset_changes: true
        }
      };
      return {
        success: true,
        message: `Reset to ${target} (mixed)`,
        effects
      };
  }
}

async function handleRevert(args: string[], gameState: GameState): Promise<CommandResult> {
  if (!args.length) {
    return {
      success: false,
      message: 'Please specify commit to revert'
    };
  }

  const commitId = args[0];
  return {
    success: true,
    message: `Reverted commit ${commitId}`,
    effects: {
      setFlag: {
        reverted_commit: true
      }
    }
  };
}