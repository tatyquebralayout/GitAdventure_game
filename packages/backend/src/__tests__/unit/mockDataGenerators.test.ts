import { GitOutputGenerator } from '../../mocks/services/generators/GitOutputGenerator';
import { CommandGenerator } from '../../mocks/services/generators/CommandGenerator';
import { FileSystemGenerator } from '../../mocks/services/generators/FileSystemGenerator';

describe('Mock Data Generators', () => {
  describe('GitOutputGenerator', () => {
    it('should generate status output', () => {
      const output = GitOutputGenerator.generateStatusOutput({
        staged: ['file1.txt', 'file2.js'],
        unstaged: ['file3.ts'],
        untracked: ['newfile.txt']
      });

      expect(output).toContain('Changes to be committed:');
      expect(output).toContain('file1.txt');
      expect(output).toContain('file2.js');
      expect(output).toContain('Changes not staged for commit:');
      expect(output).toContain('file3.ts');
      expect(output).toContain('Untracked files:');
      expect(output).toContain('newfile.txt');
    });

    it('should generate log output', () => {
      const output = GitOutputGenerator.generateLogOutput(3);
      const commitLines = output.split('\n').filter(line => line.startsWith('commit'));

      expect(commitLines).toHaveLength(3);
      expect(output).toMatch(/Author: .+/);
      expect(output).toMatch(/Date: .+/);
    });

    it('should generate branch output', () => {
      const output = GitOutputGenerator.generateBranchOutput({
        current: 'main',
        branches: ['main', 'feature/new-quest', 'bugfix/issue-123']
      });

      expect(output).toContain('* main');
      expect(output).toContain('feature/new-quest');
      expect(output).toContain('bugfix/issue-123');
    });

    it('should generate diff output', () => {
      const output = GitOutputGenerator.generateDiffOutput({
        filePath: 'src/game.ts',
        additions: 3,
        deletions: 2
      });

      expect(output).toContain('diff --git a/src/game.ts b/src/game.ts');
      expect(output).toMatch(/\+[^+]/); // Contains additions
      expect(output).toMatch(/-[^-]/); // Contains deletions
    });
  });

  describe('CommandGenerator', () => {
    it('should generate shell command output', () => {
      const output = CommandGenerator.generateShellOutput('ls', {
        success: true,
        files: ['file1.txt', 'file2.js', 'dir1/']
      });

      expect(output).toContain('file1.txt');
      expect(output).toContain('file2.js');
      expect(output).toContain('dir1/');
    });

    it('should generate error output', () => {
      const output = CommandGenerator.generateErrorOutput('git push', {
        code: 128,
        message: 'fatal: not a git repository'
      });

      expect(output).toContain('fatal: not a git repository');
      expect(output).toContain('error: 128');
    });

    it('should generate command suggestions', () => {
      const suggestions = CommandGenerator.generateSuggestions('git', 'push');
      
      expect(suggestions).toContain('git init');
      expect(suggestions).toContain('git remote add origin');
    });

    it('should generate interactive prompts', () => {
      const prompt = CommandGenerator.generateInteractivePrompt('git rebase', {
        type: 'conflict',
        files: ['src/game.ts']
      });

      expect(prompt).toContain('CONFLICT');
      expect(prompt).toContain('src/game.ts');
      expect(prompt).toContain('(fix conflicts and then run "git rebase --continue")');
    });
  });

  describe('FileSystemGenerator', () => {
    it('should generate file tree structure', () => {
      const tree = FileSystemGenerator.generateFileTree({
        depth: 2,
        files: 3,
        dirs: 2
      });

      expect(tree.files.length).toBeGreaterThanOrEqual(3);
      expect(tree.dirs.length).toBeGreaterThanOrEqual(2);
      expect(tree.dirs[0].files).toBeDefined();
    });

    it('should generate file content', () => {
      const content = FileSystemGenerator.generateFileContent({
        type: 'typescript',
        lines: 10
      });

      expect(content.split('\n').length).toBe(10);
      expect(content).toMatch(/import .+ from/);
      expect(content).toMatch(/export (class|interface|function)/);
    });

    it('should generate file changes', () => {
      const changes = FileSystemGenerator.generateFileChanges({
        path: 'src/game.ts',
        changeType: 'modify',
        lines: 5
      });

      expect(changes.additions).toBeDefined();
      expect(changes.deletions).toBeDefined();
      expect(changes.path).toBe('src/game.ts');
    });

    it('should generate directory contents', () => {
      const contents = FileSystemGenerator.generateDirectoryContents({
        path: 'src/',
        fileTypes: ['ts', 'json'],
        count: 5
      });

      expect(contents.length).toBe(5);
      contents.forEach(item => {
        expect(item.name).toMatch(/\.(ts|json)$/);
      });
    });
  });
});