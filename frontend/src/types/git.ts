// Define the structure for each commit in our history
export interface GitCommit {
  id: string; // Use 'id' consistently for hash
  message: string;
  author: string;
  date: Date;
  parents: string[]; // Array of parent commit IDs
  branch: string; // Branch this commit belongs to
}

// Define the structure for branch information
export interface GitBranch {
  name: string;
  isActive: boolean; // Indicates if this is the current branch
  isRemote: boolean;
}

// Define the structure for Git status
export interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
}

// Define the overall Git repository state
export interface GitRepositoryState {
  currentBranch: string;
  branches: GitBranch[];
  commits: GitCommit[];
  status: GitStatus;
  remotes: { name: string; url: string }[];
}