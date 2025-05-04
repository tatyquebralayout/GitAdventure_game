import React from 'react';
import { GitgraphApi } from '@gitgraph/react';

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
  payload: Record<string, unknown>;
}

// Context interface
export interface GitRepoContextType {
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
  gitgraphRef: React.RefObject<GitgraphApi | null>;
}

// Create the context
export const GitRepoContext = React.createContext<GitRepoContextType | undefined>(undefined);