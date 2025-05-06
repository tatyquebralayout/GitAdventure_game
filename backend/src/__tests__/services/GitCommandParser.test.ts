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

    it('should handle commands with quoted arguments', async () => {
      const result = await parser.parse