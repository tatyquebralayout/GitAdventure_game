import { singleton } from 'tsyringe';
import { AppError } from '../utils/AppError';

interface ParsedCommand {
  action: string;
  args: string[];
  rawCommand: string;
  isValid: boolean;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
}

@singleton()
export class GitCommandParser {
  private readonly validCommands = new Set([
    'init',
    'add',
    'commit',
    'branch',
    'checkout',
    'merge',
    'push',
    'pull'
  ]);

  async parseCommand(command: string): Promise<ParsedCommand> {
    const parts = command.trim().split(' ');
    
    if (parts[0] !== 'git') {
      throw new AppError('Command must start with "git"', 400);
    }

    const action = parts[1];
    if (!this.validCommands.has(action)) {
      throw new AppError(`Invalid git command: ${action}`, 400);
    }

    return {
      action,
      args: parts.slice(2),
      rawCommand: command,
      isValid: true
    };
  }

  async validateSemantics(command: ParsedCommand): Promise<ValidationResult> {
    switch (command.action) {
      case 'init':
        return { isValid: true, message: '' };
        
      case 'add':
        if (command.args.length === 0) {
          return { isValid: false, message: 'No files specified for add command' };
        }
        return { isValid: true, message: '' };
        
      case 'commit':
        if (!command.args.includes('-m')) {
          return { isValid: false, message: 'Commit requires a message (-m)' };
        }
        const messageIndex = command.args.indexOf('-m') + 1;
        if (messageIndex >= command.args.length) {
          return { isValid: false, message: 'No commit message provided' };
        }
        return { isValid: true, message: '' };
        
      // Add other command validations as needed
      
      default:
        return { isValid: true, message: '' };
    }
  }
}