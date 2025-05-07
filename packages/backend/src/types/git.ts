export interface ParsedCommand {
    action: string;
    args: string[];
    rawCommand: string;
    isValid: boolean;
}

export interface GitCommandResult {
    isValid: boolean;
    message?: string;
    details?: {
        files?: string[];
        branch?: string;
        status?: GitStatus;
    };
}

export interface GitStatus {
    isRepo: boolean;
    isClean: boolean;
    current: string;
    tracking: string;
    files: GitFileStatus[];
    staged: string[];
    modified: string[];
    untracked: string[];
}

export interface GitFileStatus {
    path: string;
    index: string;
    working_dir: string;
}