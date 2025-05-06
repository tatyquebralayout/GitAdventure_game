import { GitCommandParser } from '../../services/GitCommandParser';
import { ParsedCommand, ValidationResult } from '../../types/git';

describe('GitCommandParser', () => {
  let parser: GitCommandParser;

  beforeEach(() => {
    parser = new GitCommandParser();
  });

  describe('parseCommand', () => {
    const validCommands = [
      {
        input: 'git init',
        expected: {
          action: 'init',
          args: [],
          rawCommand: 'git init',
          isValid: true
        }
      },
      {
        input: 'git add .',
        expected: {
          action: 'add',
          args: ['.'],
          rawCommand: 'git add .',
          isValid: true
        }
      },
      {
        input: 'git commit -m "Initial commit"',
        expected: {
          action: 'commit',
          args: ['-m', 'Initial commit'],
          rawCommand: 'git commit -m "Initial commit"',
          isValid: true
        }
      },
      {
        input: 'git branch feature',
        expected: {
          action: 'branch',
          args: ['feature'],
          rawCommand: 'git branch feature',
          isValid: true
        }
      },
      {
        input: 'git checkout -b feature',
        expected: {
          action: 'checkout',
          args: ['-b', 'feature'],
          rawCommand: 'git checkout -b feature',
          isValid: true
        }
      }
    ];

    validCommands.forEach(({ input, expected }) => {
      it(`should correctly parse "${input}"`, async () => {
        const result = await parser.parseCommand(input);
        expect(result).toMatchObject(expected);
      });
    });

    const invalidCommands = [
      'git',
      'git invalid',
      'not-git command',
      '',
      'git commit -invalid-flag'
    ];

    invalidCommands.forEach(command => {
      it(`should reject invalid command "${command}"`, async () => {
        await expect(parser.parseCommand(command)).rejects.toThrow();
      });
    });

    it('should handle commands with multiple arguments', async () => {
      const result = await parser.parseCommand('git add file1.txt file2.txt');
      expect(result).toMatchObject({
        action: 'add',
        args: ['file1.txt', 'file2.txt'],
        isValid: true
      });
    });

    it('should handle commands with quoted arguments containing spaces', async () => {
      const result = await parser.parseCommand('git commit -m "commit message with spaces"');
      expect(result).toMatchObject({
        action: 'commit',
        args: ['-m', 'commit message with spaces'],
        isValid: true
      });
    });

    it('should handle multi-flag commands', async () => {
      const result = await parser.parseCommand('git log --oneline --graph');
      expect(result).toMatchObject({
        action: 'log',
        args: ['--oneline', '--graph'],
        isValid: true
      });
    });

    it('should preserve order of arguments', async () => {
      const result = await parser.parseCommand('git checkout -b feature --track origin/main');
      expect(result.args).toEqual(['-b', 'feature', '--track', 'origin/main']);
    });
  });

  describe('validateSemantics', () => {
    it('should validate git init command', async () => {
      const command: ParsedCommand = {
        action: 'init',
        args: [],
        rawCommand: 'git init',
        isValid: true
      };

      const result = await parser.validateSemantics(command);
      expect(result.isValid).toBe(true);
    });

    it('should validate git add command with path', async () => {
      const command: ParsedCommand = {
        action: 'add',
        args: ['file.txt'],
        rawCommand: 'git add file.txt',
        isValid: true
      };

      const result = await parser.validateSemantics(command);
      expect(result.isValid).toBe(true);
    });

    it('should validate git commit with message', async () => {
      const command: ParsedCommand = {
        action: 'commit',
        args: ['-m', 'Test commit'],
        rawCommand: 'git commit -m "Test commit"',
        isValid: true
      };

      const result = await parser.validateSemantics(command);
      expect(result.isValid).toBe(true);
    });

    it('should reject git commit without message', async () => {
      const command: ParsedCommand = {
        action: 'commit',
        args: [],
        rawCommand: 'git commit',
        isValid: true
      };

      const result = await parser.validateSemantics(command);
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('commit message');
    });

    it('should validate git branch with valid name', async () => {
      const command: ParsedCommand = {
        action: 'branch',
        args: ['feature'],
        rawCommand: 'git branch feature',
        isValid: true
      };

      const result = await parser.validateSemantics(command);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid branch names', async () => {
      const invalidNames = ['feature..test', 'feature?', '.feature', 'feature.lock'];

      for (const name of invalidNames) {
        const command: ParsedCommand = {
          action: 'branch',
          args: [name],
          rawCommand: `git branch ${name}`,
          isValid: true
        };

        const result = await parser.validateSemantics(command);
        expect(result.isValid).toBe(false);
        expect(result.message).toContain('branch name');
      }
    });

    it('should handle git checkout variations', async () => {
      const validCommands = [
        {
          command: {
            action: 'checkout',
            args: ['main'],
            rawCommand: 'git checkout main',
            isValid: true
          },
          expectedValid: true
        },
        {
          command: {
            action: 'checkout',
            args: ['-b', 'feature'],
            rawCommand: 'git checkout -b feature',
            isValid: true
          },
          expectedValid: true
        },
        {
          command: {
            action: 'checkout',
            args: ['--orphan', 'newbranch'],
            rawCommand: 'git checkout --orphan newbranch',
            isValid: true
          },
          expectedValid: true
        }
      ];

      for (const { command, expectedValid } of validCommands) {
        const result = await parser.validateSemantics(command);
        expect(result.isValid).toBe(expectedValid);
      }
    });
  });

  describe('validateCommandAgainstPattern', () => {
    it('should match exact patterns', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git init',
        '^git init$'
      );
      expect(result.isValid).toBe(true);
    });

    it('should match patterns with wildcards', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git add file.txt',
        '^git add .+$'
      );
      expect(result.isValid).toBe(true);
    });

    it('should validate commit message patterns', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git commit -m "fix: bug fix"',
        '^git commit -m "fix: .+"$'
      );
      expect(result.isValid).toBe(true);
    });

    it('should handle optional flags in patterns', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git branch -d feature',
        '^git branch (-d|--delete) [\\w-]+$'
      );
      expect(result.isValid).toBe(true);
    });

    it('should reject non-matching commands', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git status',
        '^git (add|commit|init).*$'
      );
      expect(result.isValid).toBe(false);
    });
  });
});