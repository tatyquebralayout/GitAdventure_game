import { injectable } from 'tsyringe';
import { AppError } from '../utils/AppError';

export interface ParsedCommand {
  command: string;
  args: string[];
  options: Record<string, string | boolean>;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  matches?: string[];
}

@injectable()
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

  parse(commandString: string): ParsedCommand {
    const parts = commandString.trim().split(/\s+/);
    const command = parts[0];
    const args: string[] = [];
    const options: Record<string, string | boolean> = {};

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('-')) {
        if (part.startsWith('--')) {
          const [key, value] = part.substring(2).split('=');
          options[key] = value || true;
        } else {
          const flags = part.substring(1).split('');
          flags.forEach(flag => options[flag] = true);
        }
      } else {
        args.push(part);
      }
    }

    return { command, args, options };
  }

  async validateCommandAgainstPattern(
    command: string,
    pattern: string,
    ignoreFlags: boolean = false
  ): Promise<ValidationResult> {
    const normalizedCommand = command.trim();
    const regexPattern = pattern
      .replace(/\s+/g, '\\s+')
      .replace(/\[([^\]]+)\]/g, '(?:$1)?')
      .replace(/<([^>]+)>/g, '(.+)');
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    if (ignoreFlags) {
      const parsedCommand = this.parse(normalizedCommand);
      const baseCommand = [parsedCommand.command, ...parsedCommand.args].join(' ');
      const matches = baseCommand.match(regex);
      
      return {
        isValid: !!matches,
        matches: matches ? matches.slice(1) : undefined,
        message: matches ? 'Comando válido' : 'Comando não corresponde ao padrão esperado'
      };
    }
    
    const matches = normalizedCommand.match(regex);
    
    return {
      isValid: !!matches,
      matches: matches ? matches.slice(1) : undefined,
      message: matches ? 'Comando válido' : 'Comando não corresponde ao padrão esperado'
    };
  }

  async validateSemantics(command: ParsedCommand): Promise<ValidationResult> {
    switch (command.command) {
      case 'init':
        return { isValid: true, message: '' };
        
      case 'add':
        if (command.args.length === 0) {
          return { isValid: false, message: 'No files specified for add command' };
        }
        return { isValid: true, message: '' };
        
      case 'commit':
        if (!command.options['m']) {
          return { isValid: false, message: 'Commit requires a message (-m)' };
        }
        return { isValid: true, message: '' };
        
      // Add other command validations as needed
      
      default:
        return { isValid: true, message: '' };
    }
  }
}