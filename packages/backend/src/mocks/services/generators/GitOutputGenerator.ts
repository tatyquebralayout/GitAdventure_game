import { faker } from '@faker-js/faker';

export interface StatusOptions {
  staged?: string[];
  unstaged?: string[];
  untracked?: string[];
}

export interface BranchOptions {
  current: string;
  branches: string[];
}

export interface DiffOptions {
  filePath: string;
  additions: number;
  deletions: number;
}

export class GitOutputGenerator {
  static generateStatusOutput(options: StatusOptions): string {
    let output = '';

    if (options.staged?.length) {
      output += 'Changes to be committed:\n  (use "git restore --staged <file>..." to unstage)\n';
      options.staged.forEach(file => {
        output += `\tmodified:   ${file}\n`;
      });
      output += '\n';
    }

    if (options.unstaged?.length) {
      output += 'Changes not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n';
      options.unstaged.forEach(file => {
        output += `\tmodified:   ${file}\n`;
      });
      output += '\n';
    }

    if (options.untracked?.length) {
      output += 'Untracked files:\n  (use "git add <file>..." to include in what will be committed)\n';
      options.untracked.forEach(file => {
        output += `\t${file}\n`;
      });
      output += '\n';
    }

    return output;
  }

  static generateLogOutput(count: number): string {
    let output = '';
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const commitHash = faker.git.commitSha();
      const author = faker.person.fullName();
      const email = faker.internet.email();
      const date = faker.date.recent({ days: 30, refDate: now });
      const message = faker.git.commitMessage();

      output += `commit ${commitHash}\n`;
      output += `Author: ${author} <${email}>\n`;
      output += `Date:   ${date.toISOString()}\n\n`;
      output += `    ${message}\n\n`;
    }

    return output;
  }

  static generateBranchOutput(options: BranchOptions): string {
    return options.branches
      .map(branch => branch === options.current ? `* ${branch}` : `  ${branch}`)
      .join('\n');
  }

  static generateDiffOutput(options: DiffOptions): string {
    const output: string[] = [
      `diff --git a/${options.filePath} b/${options.filePath}`,
      'index 1234567..89abcdef 100644',
      `--- a/${options.filePath}`,
      `+++ b/${options.filePath}`,
      '@@ -1,5 +1,5 @@'
    ];

    // Generate some realistic-looking diff content
    for (let i = 0; i < options.deletions; i++) {
      output.push(`-${faker.git.commitMessage()}`);
    }

    for (let i = 0; i < options.additions; i++) {
      output.push(`+${faker.git.commitMessage()}`);
    }

    return output.join('\n');
  }

  static generateMergeConflictOutput(files: string[]): string {
    let output = 'Auto-merging failed\n';
    output += 'CONFLICT (content): Merge conflict in:\n';
    files.forEach(file => {
      output += `  ${file}\n`;
    });
    output += 'Automatic merge failed; fix conflicts and then commit the result.\n';
    return output;
  }

  static generateRemoteOutput(): string {
    return [
      'origin\thttps://github.com/username/repo.git (fetch)',
      'origin\thttps://github.com/username/repo.git (push)'
    ].join('\n');
  }
}