import { GitCommandParser } from '../../services/GitCommandParser';
import { ParsedCommand, ValidationResult } from '../../types/git';

describe('GitCommandParser', () => {
  let parser: GitCommandParser;

  beforeEach(() => {
    parser = new GitCommandParser();
  });

  describe('parse', () => {
    it('should parse basic command', () => {
      const result = parser.parse('git init');
      expect(result).toEqual({
        command: 'git',
        args: ['init'],
        options: {}
      });
    });

    it('should parse command with multiple arguments', () => {
      const result = parser.parse('git add file1.txt file2.txt');
      expect(result).toEqual({
        command: 'git',
        args: ['add', 'file1.txt', 'file2.txt'],
        options: {}
      });
    });

    it('should parse command with short flags', () => {
      const result = parser.parse('git commit -m "message" -a');
      expect(result).toEqual({
        command: 'git',
        args: ['commit', '"message"'],
        options: {
          m: true,
          a: true
        }
      });
    });

    it('should parse command with long flags', () => {
      const result = parser.parse('git push --force --set-upstream origin main');
      expect(result).toEqual({
        command: 'git',
        args: ['push', 'origin', 'main'],
        options: {
          force: true,
          'set-upstream': true
        }
      });
    });

    it('should parse command with flag values', () => {
      const result = parser.parse('git config --global user.name="John Doe"');
      expect(result).toEqual({
        command: 'git',
        args: ['config'],
        options: {
          global: true,
          'user.name': '"John Doe"'
        }
      });
    });
  });

  describe('validateCommandAgainstPattern', () => {
    it('should validate exact match pattern', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git init',
        '^git init$'
      );

      expect(result).toEqual({
        isValid: true,
        message: 'Comando válido',
        matches: []
      });
    });

    it('should validate pattern with capture groups', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git checkout -b feature/123',
        '^git checkout -b (.+)$'
      );

      expect(result).toEqual({
        isValid: true,
        message: 'Comando válido',
        matches: ['feature/123']
      });
    });

    it('should handle optional parts in pattern', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git add .',
        '^git add (\\.|[^\\s]+)$'
      );

      expect(result).toEqual({
        isValid: true,
        message: 'Comando válido',
        matches: ['.']
      });
    });

    it('should reject invalid commands', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git invalid',
        '^git (add|commit|push)$'
      );

      expect(result).toEqual({
        isValid: false,
        message: 'Comando não corresponde ao padrão esperado'
      });
    });

    it('should ignore flags when configured', async () => {
      const result = await parser.validateCommandAgainstPattern(
        'git add -A',
        '^git add',
        true
      );

      expect(result).toEqual({
        isValid: true,
        message: 'Comando válido',
        matches: []
      });
    });
  });
});