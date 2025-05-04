import React, { createContext, useState, useContext, ReactNode } from 'react';
import { GitBranch, GitCommit } from '../components/GitGraph/GitGraph';
import { commandsApi } from '../api/commandsApi';

interface GitFile {
  name: string;
  status: 'untracked' | 'modified' | 'staged' | 'committed';
}

interface GitRepositoryContextType {
  commits: GitCommit[];
  branches: GitBranch[];
  files: GitFile[];
  currentBranch: string;
  // Command execution
  executeCommand: (command: string) => Promise<{ success: boolean; message: string }>;
  // Repository actions
  addFile: (fileName: string) => void;
  stageFile: (fileName: string) => void;
  createCommit: (message: string) => void;
  createBranch: (branchName: string) => void;
  checkoutBranch: (branchName: string) => void;
  mergeBranch: (sourceBranch: string, targetBranch: string) => void;
}

const GitRepositoryContext = createContext<GitRepositoryContextType | undefined>(undefined);

// Movendo esta função para um arquivo separado resolveria o aviso do Fast Refresh
// mas como isso exigiria reorganizar imports em vários arquivos, vamos mantê-la
// e usar o comentário abaixo para suprimir o aviso
// eslint-disable-next-line react-refresh/only-export-components
export function useGitRepository() {
  const context = useContext(GitRepositoryContext);
  if (!context) {
    throw new Error('useGitRepository must be used within a GitRepositoryProvider');
  }
  return context;
}

interface GitRepositoryProviderProps {
  children: ReactNode;
}

export function GitRepositoryProvider({ children }: GitRepositoryProviderProps) {
  const [commits, setCommits] = useState<GitCommit[]>([
    { sha: 'c1', message: 'Initial commit', branch: 'main' }
  ]);

  const [branches, setBranches] = useState<GitBranch[]>([
    { name: 'main', isActive: true }
  ]);

  const [files, setFiles] = useState<GitFile[]>([
    { name: 'index.html', status: 'committed' }
  ]);

  // Track current quest step for validation
  const [currentQuestStep, setCurrentQuestStep] = useState<number>(1);

  const currentBranch = branches.find(b => b.isActive)?.name || 'main';

  // Add a new file to the working directory
  const addFile = (fileName: string) => {
    if (!files.some(f => f.name === fileName)) {
      setFiles([...files, { name: fileName, status: 'untracked' }]);
    }
  };

  // Stage a file
  const stageFile = (fileName: string) => {
    setFiles(files.map(file => 
      file.name === fileName ? { ...file, status: 'staged' } : file
    ));
  };

  // Create a commit
  const createCommit = (message: string) => {
    const activeBranch = branches.find(b => b.isActive)?.name || 'main';
    const newCommit: GitCommit = {
      sha: `c${commits.length + 1}`, // Simple sequential commit id
      message,
      branch: activeBranch
    };
    
    setCommits([...commits, newCommit]);
    
    // Change status of staged files to committed
    const stagedFiles = files.filter(f => f.status === 'staged');
    if (stagedFiles.length > 0) {
      setFiles(files.map(file => 
        file.status === 'staged' ? { ...file, status: 'committed' } : file
      ));
    }
  };

  // Create a new branch
  const createBranch = (branchName: string) => {
    if (branches.some(b => b.name === branchName)) {
      return; // Branch already exists
    }
    
    setBranches([...branches, { name: branchName, isActive: false }]);
  };

  // Switch to a different branch
  const checkoutBranch = (branchName: string) => {
    if (!branches.some(b => b.name === branchName)) {
      return; // Branch doesn't exist
    }
    
    setBranches(branches.map(branch => ({
      ...branch,
      isActive: branch.name === branchName
    })));
  };

  // Merge a branch into another
  const mergeBranch = (sourceBranch: string, targetBranch: string) => {
    const sourceExists = branches.some(b => b.name === sourceBranch);
    const targetExists = branches.some(b => b.name === targetBranch);
    
    if (!sourceExists || !targetExists) {
      return; // One of the branches doesn't exist
    }
    
    // Create a merge commit on the target branch
    const mergeCommit: GitCommit = {
      sha: `c${commits.length + 1}`,
      message: `Merge branch '${sourceBranch}' into ${targetBranch}`,
      branch: targetBranch
    };
    
    setCommits([...commits, mergeCommit]);
  };

  // Apply Git action based on the command
  const applyGitAction = async (commandStr: string): Promise<{ success: boolean; message: string }> => {
    const commandStr_trimmed = commandStr.trim();
    
    // Git init command
    if (commandStr_trimmed === 'git init') {
      // If we already have an initial commit, this is redundant
      if (commits.length > 0) {
        return { success: true, message: 'Git repository already initialized' };
      }
      
      setCommits([{ sha: 'c1', message: 'Initial commit', branch: 'main' }]);
      setBranches([{ name: 'main', isActive: true }]);
      return { success: true, message: 'Initialized empty Git repository' };
    }
    
    // Git status command
    if (commandStr_trimmed === 'git status') {
      return { 
        success: true, 
        message: `On branch ${currentBranch}\n\n` +
          (files.some(f => f.status === 'staged') 
            ? 'Changes to be committed:\n  ' +
              files.filter(f => f.status === 'staged')
                  .map(f => `modified: ${f.name}`).join('\n  ') + '\n\n'
            : '') +
          (files.some(f => f.status === 'modified' || f.status === 'untracked')
            ? 'Changes not staged for commit:\n  ' +
              files.filter(f => f.status === 'modified' || f.status === 'untracked')
                  .map(f => `${f.status === 'modified' ? 'modified' : 'untracked'}: ${f.name}`).join('\n  ')
            : '')
      };
    }
    
    // Git add command
    if (commandStr_trimmed.startsWith('git add ')) {
      const fileArg = commandStr_trimmed.substring('git add '.length).trim();
      
      // Handle git add .
      if (fileArg === '.') {
        const filesChanged = files.filter(f => f.status === 'untracked' || f.status === 'modified').length;
        setFiles(files.map(file => 
          (file.status === 'untracked' || file.status === 'modified') 
            ? { ...file, status: 'staged' } 
            : file
        ));
        return { success: true, message: `Added ${filesChanged} files to staging area` };
      }
      
      // Handle adding specific file
      const fileToAdd = files.find(f => f.name === fileArg);
      if (!fileToAdd) {
        return { success: false, message: `Error: file '${fileArg}' not found` };
      }
      
      stageFile(fileArg);
      return { success: true, message: `Added '${fileArg}' to staging area` };
    }
    
    // Git commit command
    if (commandStr_trimmed.startsWith('git commit ')) {
      // Check for message flag
      if (!commandStr_trimmed.includes('-m ')) {
        return { success: false, message: 'Error: commit message is required. Use -m "Your message"' };
      }
      
      const messageMatch = commandStr_trimmed.match(/-m "([^"]*)"/);
      if (!messageMatch || !messageMatch[1]) {
        return { success: false, message: 'Error: invalid commit message format. Use -m "Your message"' };
      }
      
      const commitMessage = messageMatch[1];
      const stagedFiles = files.filter(f => f.status === 'staged');
      
      if (stagedFiles.length === 0) {
        return { success: false, message: 'Error: no files staged for commit' };
      }
      
      createCommit(commitMessage);
      return { 
        success: true, 
        message: `[${currentBranch} ${commits[commits.length - 1].sha}] ${commitMessage}` 
      };
    }
    
    // Git branch command
    if (commandStr_trimmed.startsWith('git branch ')) {
      const branchName = commandStr_trimmed.substring('git branch '.length).trim();
      
      // Make sure the branch name is valid
      if (!branchName.match(/^[a-zA-Z0-9\-_]+$/)) {
        return { success: false, message: 'Error: invalid branch name' };
      }
      
      if (branches.some(b => b.name === branchName)) {
        return { success: false, message: `Error: branch '${branchName}' already exists` };
      }
      
      createBranch(branchName);
      return { success: true, message: `Created branch '${branchName}'` };
    }
    
    // Git checkout command
    if (commandStr_trimmed.startsWith('git checkout ')) {
      const branchName = commandStr_trimmed.substring('git checkout '.length).trim();
      
      if (!branches.some(b => b.name === branchName)) {
        return { success: false, message: `Error: branch '${branchName}' does not exist` };
      }
      
      checkoutBranch(branchName);
      return { success: true, message: `Switched to branch '${branchName}'` };
    }
    
    // Git merge command
    if (commandStr_trimmed.startsWith('git merge ')) {
      const sourceBranch = commandStr_trimmed.substring('git merge '.length).trim();
      
      if (!branches.some(b => b.name === sourceBranch)) {
        return { success: false, message: `Error: branch '${sourceBranch}' does not exist` };
      }
      
      if (sourceBranch === currentBranch) {
        return { success: false, message: `Error: cannot merge branch '${sourceBranch}' into itself` };
      }
      
      mergeBranch(sourceBranch, currentBranch);
      return { success: true, message: `Merged branch '${sourceBranch}' into ${currentBranch}` };
    }
    
    // If we get here, command was not recognized or not implemented
    return { success: false, message: `Error: command not recognized: ${commandStr_trimmed}` };
  };

  // Parse and execute commands with backend validation
  const executeCommand = async (commandStr: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate command with backend API first
      const validationResult = await commandsApi.validateCommand(
        commandStr, 
        1, // Default questId
        currentQuestStep
      );
      
      // If validation fails, return the error message
      if (!validationResult.valid) {
        return { 
          success: false, 
          message: validationResult.message 
        };
      }
      
      // If validation succeeds, execute the command
      const result = await applyGitAction(commandStr);
      
      // If command execution was successful and we have a next step, update step tracker
      if (result.success && validationResult.nextStep) {
        setCurrentQuestStep(validationResult.nextStep);
      }
      
      return result;
    } catch (error) {
      console.error('Error executing command:', error);
      return { 
        success: false, 
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  const value: GitRepositoryContextType = {
    commits,
    branches,
    files,
    currentBranch,
    executeCommand,
    addFile,
    stageFile,
    createCommit,
    createBranch,
    checkoutBranch,
    mergeBranch
  };

  return (
    <GitRepositoryContext.Provider value={value}>
      {children}
    </GitRepositoryContext.Provider>
  );
}