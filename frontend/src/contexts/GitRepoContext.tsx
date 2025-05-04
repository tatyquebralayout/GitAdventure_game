import React, { createContext, useState, useContext, ReactNode, useRef } from 'react';
import { commandsApi } from '../api/commandsApi';

// Types
export interface Branch {
  name: string;
  isActive: boolean;
  color?: string;
}

export interface Commit {
  id: string;
  message: string;
  branch: string;
  timestamp: number;
  parentCommitIds: string[];
}

export interface GitAction {
  type: 'commit' | 'branch' | 'checkout' | 'merge' | 'init';
  payload: Record<string, any>;
}

// Context interface
interface GitRepoContextType {
  // Mermaid representation
  mermaidLines: string[];
  addMermaidLine: (line: string) => void;
  clearMermaidLines: () => void;
  
  // GitGraph state
  branches: Branch[];
  commits: Commit[];
  currentBranch: string;
  
  // Git actions
  executeCommand: (cmd: string) => Promise<{ success: boolean; message: string }>;
  createCommit: (message: string, branch?: string) => void;
  createBranch: (branchName: string) => void;
  checkoutBranch: (branchName: string) => void;
  mergeBranch: (sourceBranch: string, targetBranch: string) => void;
  
  // Reference to the GitGraph instance
  gitgraphRef: React.MutableRefObject<any | null>;
}

const GitRepoContext = createContext<GitRepoContextType | undefined>(undefined);

interface GitRepoProviderProps {
  children: ReactNode;
}

export function GitRepoProvider({ children }: GitRepoProviderProps) {
  // Mermaid representation state
  const [mermaidLines, setMermaidLines] = useState<string[]>(['gitGraph', '  commit id: "initial"']);
  
  // GitGraph state
  const [branches, setBranches] = useState<Branch[]>([
    { name: 'main', isActive: true, color: '#0366d6' }
  ]);
  const [commits, setCommits] = useState<Commit[]>([
    { id: 'initial', message: 'Initial commit', branch: 'main', timestamp: Date.now(), parentCommitIds: [] }
  ]);
  
  // Reference to the GitGraph instance for programmatic operations
  const gitgraphRef = useRef<any>(null);
  
  // Get current branch
  const currentBranch = branches.find(b => b.isActive)?.name || 'main';

  // Mermaid functions
  const addMermaidLine = (line: string) => {
    setMermaidLines(prev => [...prev, line]);
  };

  const clearMermaidLines = () => {
    setMermaidLines(['gitGraph', '  commit id: "initial"']);
  };

  // GitGraph operations
  const createCommit = (message: string, branch?: string) => {
    const targetBranch = branch || currentBranch;
    const timestamp = Date.now();
    const id = `commit-${timestamp}`;
    
    // Find parent commits
    const parentCommits = commits.filter(c => c.branch === targetBranch);
    const parentCommitIds = parentCommits.length > 0 
      ? [parentCommits[parentCommits.length - 1].id] 
      : [];
    
    // Create new commit
    const newCommit: Commit = {
      id,
      message,
      branch: targetBranch,
      timestamp,
      parentCommitIds
    };
    
    // Update state
    setCommits([...commits, newCommit]);
    
    // Add to Mermaid representation
    addMermaidLine(`  commit id: "${id}" message: "${message}"`);
    
    // Update GitGraph if ref is available
    if (gitgraphRef.current) {
      const branchRef = gitgraphRef.current.branch(targetBranch);
      branchRef.commit({ subject: message, hash: id });
    }
  };

  const createBranch = (branchName: string) => {
    if (branches.some(b => b.name === branchName)) {
      return; // Branch already exists
    }
    
    // Create new branch
    const newBranch: Branch = {
      name: branchName,
      isActive: false,
      color: getRandomColor()
    };
    
    // Update state
    setBranches([...branches, newBranch]);
    
    // Add to Mermaid representation
    addMermaidLine(`  branch ${branchName}`);
    
    // Update GitGraph if ref is available
    if (gitgraphRef.current) {
      gitgraphRef.current.branch(branchName);
    }
  };

  const checkoutBranch = (branchName: string) => {
    if (!branches.some(b => b.name === branchName)) {
      return; // Branch doesn't exist
    }
    
    // Update branches
    setBranches(branches.map(branch => ({
      ...branch,
      isActive: branch.name === branchName
    })));
    
    // Add to Mermaid representation
    addMermaidLine(`  checkout ${branchName}`);
    
    // Update GitGraph if ref is available
    if (gitgraphRef.current) {
      gitgraphRef.current.checkout(branchName);
    }
  };

  const mergeBranch = (sourceBranch: string, targetBranch: string) => {
    const sourceExists = branches.some(b => b.name === sourceBranch);
    const targetExists = branches.some(b => b.name === targetBranch);
    
    if (!sourceExists || !targetExists) {
      return; // One of the branches doesn't exist
    }
    
    // Find latest commits from both branches
    const sourceCommit = [...commits].reverse().find(c => c.branch === sourceBranch);
    const targetCommit = [...commits].reverse().find(c => c.branch === targetBranch);
    
    if (!sourceCommit || !targetCommit) {
      return; // No commits in one of the branches
    }
    
    // Create a merge commit
    const timestamp = Date.now();
    const id = `merge-${timestamp}`;
    
    const mergeCommit: Commit = {
      id,
      message: `Merge branch '${sourceBranch}' into ${targetBranch}`,
      branch: targetBranch,
      timestamp,
      parentCommitIds: [targetCommit.id, sourceCommit.id]
    };
    
    // Update state
    setCommits([...commits, mergeCommit]);
    
    // Add to Mermaid representation
    addMermaidLine(`  checkout ${targetBranch}`);
    addMermaidLine(`  merge ${sourceBranch} id: "${id}" message: "Merge branch '${sourceBranch}' into ${targetBranch}"`);
    
    // Update GitGraph if ref is available
    if (gitgraphRef.current) {
      const targetBranchRef = gitgraphRef.current.branch(targetBranch);
      targetBranchRef.merge(sourceBranch, `Merge branch '${sourceBranch}' into ${targetBranch}`);
    }
  };

  // Generate random color for branches
  const getRandomColor = () => {
    const colors = ['#0366d6', '#28a745', '#f9826c', '#6f42c1', '#e36209', '#00b5ad', '#6c757d', '#fd7e14'];
    const usedColors = branches.map(b => b.color);
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    if (availableColors.length > 0) {
      return availableColors[0];
    }
    
    // If all colors are used, generate a random one
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
  };

  // Execute Git command
  const executeCommand = async (cmd: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate command with backend API
      const validationResult = await commandsApi.validateCommand(cmd);
      
      // If validation fails, return the error message
      if (!validationResult.valid) {
        return { 
          success: false, 
          message: validationResult.message 
        };
      }
      
      // Process command after validation
      const commandStr = cmd.trim();
      
      // Git init command
      if (commandStr === 'git init') {
        // Reset state
        setBranches([{ name: 'main', isActive: true, color: '#0366d6' }]);
        setCommits([{ 
          id: 'initial', 
          message: 'Initial commit', 
          branch: 'main', 
          timestamp: Date.now(), 
          parentCommitIds: [] 
        }]);
        clearMermaidLines();
        
        // Update GitGraph if ref is available
        if (gitgraphRef.current) {
          // Reset GitGraph (implementation depends on library)
        }
        
        return { success: true, message: 'Initialized empty Git repository' };
      }
      
      // Git commit command
      if (commandStr.startsWith('git commit')) {
        const messageMatch = commandStr.match(/-m "([^"]*)"/);
        if (!messageMatch || !messageMatch[1]) {
          return { success: false, message: 'Error: invalid commit message format. Use -m "Your message"' };
        }
        
        const commitMessage = messageMatch[1];
        createCommit(commitMessage);
        
        return { success: true, message: `[${currentBranch}] ${commitMessage}` };
      }
      
      // Git branch command
      if (commandStr.startsWith('git branch ')) {
        const branchName = commandStr.substring('git branch '.length).trim();
        
        if (branches.some(b => b.name === branchName)) {
          return { success: false, message: `Error: branch '${branchName}' already exists` };
        }
        
        createBranch(branchName);
        return { success: true, message: `Created branch '${branchName}'` };
      }
      
      // Git checkout command
      if (commandStr.startsWith('git checkout ')) {
        const branchName = commandStr.substring('git checkout '.length).trim();
        
        if (!branches.some(b => b.name === branchName)) {
          return { success: false, message: `Error: branch '${branchName}' does not exist` };
        }
        
        checkoutBranch(branchName);
        return { success: true, message: `Switched to branch '${branchName}'` };
      }
      
      // Git merge command
      if (commandStr.startsWith('git merge ')) {
        const sourceBranch = commandStr.substring('git merge '.length).trim();
        
        if (!branches.some(b => b.name === sourceBranch)) {
          return { success: false, message: `Error: branch '${sourceBranch}' does not exist` };
        }
        
        if (sourceBranch === currentBranch) {
          return { success: false, message: `Error: cannot merge branch '${sourceBranch}' into itself` };
        }
        
        mergeBranch(sourceBranch, currentBranch);
        return { success: true, message: `Merged branch '${sourceBranch}' into ${currentBranch}` };
      }
      
      // If we get here, command was not implemented
      return { success: false, message: `Error: command not implemented: ${commandStr}` };
    } catch (error) {
      console.error('Error executing command:', error);
      return { 
        success: false, 
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  };

  // Context value
  const value: GitRepoContextType = {
    mermaidLines,
    addMermaidLine,
    clearMermaidLines,
    branches,
    commits,
    currentBranch,
    executeCommand,
    createCommit,
    createBranch,
    checkoutBranch,
    mergeBranch,
    gitgraphRef
  };

  return (
    <GitRepoContext.Provider value={value}>
      {children}
    </GitRepoContext.Provider>
  );
}

export function useGitRepo() {
  const context = useContext(GitRepoContext);
  if (!context) {
    throw new Error('useGitRepo must be used within a GitRepoProvider');
  }
  return context;
}