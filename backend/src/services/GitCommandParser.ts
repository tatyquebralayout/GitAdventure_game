import { injectable } from 'tsyringe';
import simpleGit, { SimpleGit } from 'simple-git';
import { ParsedCommand, GitCommandResult } from '../types/git';

@injectable()
export class GitCommandParser {
    private git: SimpleGit;

    constructor() {
        this.git = simpleGit();
    }

    async parseCommand(command: string): Promise<ParsedCommand> {
        const parts = command.split(' ');
        if (parts[0] !== 'git') {
            throw new Error('Not a git command');
        }

        const action = parts[1];
        const args = parts.slice(2);

        return {
            action,
            args,
            rawCommand: command,
            isValid: await this.validateSyntax(action, args)
        };
    }

    private async validateSyntax(action: string, args: string[]): Promise<boolean> {
        try {
            await this.git.raw(['help', action]);
            return true;
        } catch {
            return false;
        }
    }

    async validateSemantics(parsedCommand: ParsedCommand): Promise<GitCommandResult> {
        const { action, args } = parsedCommand;

        try {
            switch (action) {
                case 'init':
                    return this.validateInit();
                case 'add':
                    return this.validateAdd(args);
                case 'commit':
                    return this.validateCommit(args);
                case 'branch':
                    return this.validateBranch(args);
                case 'checkout':
                    return this.validateCheckout(args);
                default:
                    return { isValid: false, message: 'Unsupported command' };
            }
        } catch (error) {
            return {
                isValid: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    private async validateInit(): Promise<GitCommandResult> {
        try {
            const status = await this.git.status();
            // Check if we're already in a git repo by checking if the status has a current branch
            if (status.current) {
                return { 
                    isValid: false, 
                    message: 'Git repository already initialized' 
                };
            }
            return { isValid: true };
        } catch {
            return { isValid: true }; // If status fails, we're not in a git repo
        }
    }

    private async validateAdd(args: string[]): Promise<GitCommandResult> {
        if (args.length === 0) {
            return { 
                isValid: false, 
                message: 'No files specified for git add' 
            };
        }

        try {
            const status = await this.git.status();
            const files = args[0] === '.' ? status.files : args;
            
            for (const file of files) {
                if (!status.files.some(f => f.path === file)) {
                    return { 
                        isValid: false, 
                        message: `File ${file} not found or not modified` 
                    };
                }
            }

            return { isValid: true };
        } catch {
            return { 
                isValid: false, 
                message: 'Error checking git status' 
            };
        }
    }

    private async validateCommit(args: string[]): Promise<GitCommandResult> {
        const messageIndex = args.indexOf('-m');
        if (messageIndex === -1 || !args[messageIndex + 1]) {
            return { 
                isValid: false, 
                message: 'Commit message is required (-m "message")' 
            };
        }

        try {
            const status = await this.git.status();
            if (!status.staged.length) {
                return { 
                    isValid: false, 
                    message: 'No changes staged for commit' 
                };
            }

            return { isValid: true };
        } catch {
            return { 
                isValid: false, 
                message: 'Error checking git status' 
            };
        }
    }

    private async validateBranch(args: string[]): Promise<GitCommandResult> {
        if (args.length === 0) {
            return { isValid: true }; // Listing branches is valid
        }

        try {
            const branches = await this.git.branch();
            if (branches.all.includes(args[0])) {
                return { 
                    isValid: false, 
                    message: 'Branch already exists' 
                };
            }

            return { isValid: true };
        } catch {
            return { 
                isValid: false, 
                message: 'Error checking branches' 
            };
        }
    }

    private async validateCheckout(args: string[]): Promise<GitCommandResult> {
        if (args.length === 0) {
            return { 
                isValid: false, 
                message: 'Branch name is required' 
            };
        }

        try {
            const branches = await this.git.branch();
            if (!branches.all.includes(args[0]) && !args.includes('-b')) {
                return { 
                    isValid: false, 
                    message: 'Branch does not exist' 
                };
            }

            const status = await this.git.status();
            if (status.modified.length > 0) {
                return { 
                    isValid: false, 
                    message: 'You have unstaged changes' 
                };
            }

            return { isValid: true };
        } catch {
            return { 
                isValid: false, 
                message: 'Error checking repository state' 
            };
        }
    }
}