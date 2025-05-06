import { GitCommandParser } from '../../services/GitCommandParser';
import { ParsedCommand } from '../../types/git';

describe('GitCommandParser', () => {
  let parser: GitCommandParser;

  beforeEach(() => {
    parser = new GitCommandParser();
  });

  describe('parseCommand', () => {
    it('should parse valid git commands', async () => {
      const command = 'git init';
      const result = await parser.parseCommand(command);
      expect(result).toMatchObject({
        action: 'init',
        args: [],
        rawCommand: command,
        isValid: true
      });
    });

    it('should reject non-git commands', async () => {
      await expect(parser.parseCommand('npm install')).rejects.toThrow('Not a git command');
    });

    it('should parse commands with arguments', async () => {
      const result = await parser.parseCommand('git add file.txt');
      expect(result).toMatchObject({
        action: 'add',
        args: ['file.txt'],
        isValid: true
      });
    });
  });

  describe('validateSemantics', () => {
    const mockCommand: ParsedCommand = {
      action: 'init',
      args: [],
      rawCommand: 'git init',
      isValid: true
    };

    it('should validate git init command', async () => {
      const result = await parser.validateSemantics(mockCommand);
      expect(result.isValid).toBe(true);
    });

    it('should validate git add command', async () => {
      const addCommand: ParsedCommand = {
        action: 'add',
        args: ['.'],
        rawCommand: 'git add .',
        isValid: true
      };
      const result = await parser.validateSemantics(addCommand);
      expect(result.isValid).toBe(true);
    });

    it('should validate git commit command with message', async () => {
      const commitCommand: ParsedCommand = {
        action: 'commit',
        args: ['-m', 'Initial commit'],
        rawCommand: 'git commit -m "Initial commit"',
        isValid: true
      };
      const result = await parser.validateSemantics(commitCommand);
      expect(result.isValid).toBe(true);
    });

    it('should reject git commit without message', async () => {
      const invalidCommand: ParsedCommand = {
        action: 'commit',
        args: [],
        rawCommand: 'git commit',
        isValid: true
      };
      const result = await parser.validateSemantics(invalidCommand);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('message is required');
    });
  });
});