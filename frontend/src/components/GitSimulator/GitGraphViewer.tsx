import React, { useRef } from 'react';
import { Gitgraph, templateExtend, TemplateName, GitgraphInterface, GitgraphBranch } from '@gitgraph/react';
import { Branch, Commit } from '../../contexts/GitRepoContext';
import './GitGraphViewer.css';

// Utilizamos as interfaces definidas no arquivo gitgraph.d.ts sem importá-las
interface GitGraphViewerProps {
  repoState: {
    branches: Branch[];
    commits: Commit[];
  };
  gitgraphRef?: React.RefObject<GitgraphInterface>;
}

const GitGraphViewer: React.FC<GitGraphViewerProps> = ({ repoState, gitgraphRef }) => {
  const { branches, commits } = repoState;
  
  // Reference to store the gitgraph instance for dynamic commands
  const internalGitgraphRef = useRef<GitgraphInterface | null>(null);
  
  // Custom template for the GitGraph visualization
  const customTemplate = templateExtend(TemplateName.Metro, {
    colors: ['#0366d6', '#28a745', '#f9826c', '#6f42c1', '#e36209'],
    branch: {
      lineWidth: 2,
      spacing: 20,
      label: {
        font: "normal 12px Arial",
        bgColor: "#f1f8ff", // Light blue background
      },
    },
    commit: {
      spacing: 50,
      dot: {
        size: 8,
      },
      message: {
        font: "normal 12px Arial",
        display: true,
      },
    },
  });
  
  return (
    <div className="git-graph-viewer">
      <Gitgraph options={{ template: customTemplate }}>
        {(gitgraph: GitgraphInterface) => {
          // Store reference to gitgraph for external commands
          if (gitgraphRef) {
            gitgraphRef.current = gitgraph;
          }
          internalGitgraphRef.current = gitgraph;
          
          // Create branch objects
          const branchRefs: Record<string, GitgraphBranch> = {};
          
          // First, create the main branch
          const mainBranch = branches.find(b => b.name === 'main');
          if (mainBranch) {
            branchRefs['main'] = gitgraph.branch('main');
          }
          
          // For each branch, create it at the right position in commit history
          branches.forEach(branch => {
            if (branch.name === 'main') return; // Skip main branch as it's already created
            
            // Find the first commit of this branch
            const branchCommit = commits.find(c => c.branch === branch.name);
            if (branchCommit) {
              // Find the parent branch and position
              const parentCommit = commits.find(c => branchCommit.parentCommitIds.includes(c.id));
              const parentBranch = parentCommit ? parentCommit.branch : 'main';
              
              // Create branch from parent
              if (branchRefs[parentBranch]) {
                branchRefs[branch.name] = branchRefs[parentBranch].branch(branch.name);
              } else {
                branchRefs[branch.name] = gitgraph.branch(branch.name);
              }
            } else {
              branchRefs[branch.name] = gitgraph.branch(branch.name);
            }
          });
          
          // For each commit, add it to the appropriate branch
          commits.sort((a, b) => a.timestamp - b.timestamp).forEach(commit => {
            // Skip commits that are merge commits - they'll be handled separately
            if (commit.parentCommitIds.length <= 1) {
              const branch = branchRefs[commit.branch];
              if (branch) {
                branch.commit({
                  subject: commit.message,
                  hash: commit.id,
                });
              }
            }
          });
          
          // Handle merge commits
          commits
            .filter(commit => commit.parentCommitIds.length > 1)
            .sort((a, b) => a.timestamp - b.timestamp)
            .forEach(mergeCommit => {
              // Find source branch for merge
              const sourceBranchName = commits.find(
                c => mergeCommit.parentCommitIds.includes(c.id) && c.branch !== mergeCommit.branch
              )?.branch;
              
              if (sourceBranchName && branchRefs[mergeCommit.branch]) {
                branchRefs[mergeCommit.branch].merge({
                  branch: branchRefs[sourceBranchName],
                  subject: mergeCommit.message,
                  commitOptions: {
                    hash: mergeCommit.id,
                  },
                });
              }
            });
          
          // Set the current branch as checked out
          const activeBranch = branches.find(b => b.isActive);
          if (activeBranch && branchRefs[activeBranch.name]) {
            branchRefs[activeBranch.name].checkout();
          }
        }}
      </Gitgraph>
    </div>
  );
};

export default GitGraphViewer;