import React, { useRef } from 'react';
// Correctly import GitgraphReact as the component
import { GitgraphReact, templateExtend, TemplateName, GitgraphApi, GitgraphBranchApi } from '@gitgraph/react';
import { Branch, Commit } from '../../contexts/GitRepoContextTypes';
import './GitGraphViewer.css';

// --- Helper Functions --- //

const createBranches = (
  gitgraph: GitgraphApi,
  branches: Branch[],
  commits: Commit[],
  branchRefs: Record<string, GitgraphBranchApi>
) => {
  const mainBranch = branches.find(b => b.name === 'main');
  if (mainBranch) {
    branchRefs['main'] = gitgraph.branch('main');
  }

  branches.forEach(branch => {
    if (branch.name === 'main') return;

    const firstCommitOfBranch = commits.find(c => c.branch === branch.name);
    let parentBranchName = 'main';

    if (firstCommitOfBranch && firstCommitOfBranch.parentCommitIds.length > 0) {
      const parentCommit = commits.find(c => 
        firstCommitOfBranch.parentCommitIds.includes(c.id) && c.branch !== branch.name
      );
      if (parentCommit) {
        parentBranchName = parentCommit.branch;
      } else {
        const parentOnSameBranch = commits.find(c => firstCommitOfBranch.parentCommitIds.includes(c.id));
        if (parentOnSameBranch) {
          const branchingCommit = commits.find(c => c.id === parentOnSameBranch.id);
          if (branchingCommit) parentBranchName = branchingCommit.branch;
        }
      }
    }

    const parentBranchRef = branchRefs[parentBranchName];
    if (parentBranchRef) {
      branchRefs[branch.name] = parentBranchRef.branch(branch.name);
    } else {
      branchRefs[branch.name] = gitgraph.branch(branch.name);
    }
  });
};

const addCommits = (
  commits: Commit[],
  branchRefs: Record<string, GitgraphBranchApi>
) => {
  commits
    .filter(commit => commit.parentCommitIds.length <= 1)
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach(commit => {
      const branch = branchRefs[commit.branch];
      if (branch) {
        branch.commit({
          subject: commit.message,
          hash: commit.id,
        });
      }
    });
};

const addMerges = (
  commits: Commit[],
  branchRefs: Record<string, GitgraphBranchApi>
) => {
  commits
    .filter(commit => commit.parentCommitIds.length > 1)
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach(mergeCommit => {
      const targetBranch = branchRefs[mergeCommit.branch];
      if (!targetBranch) return;

      const sourceCommit = commits.find(c => c.id === mergeCommit.parentCommitIds[1]);
      const sourceBranchName = sourceCommit?.branch;
      const sourceBranch = sourceBranchName ? branchRefs[sourceBranchName] : undefined;

      if (sourceBranch && sourceBranchName !== mergeCommit.branch) {
        targetBranch.merge({
          branch: sourceBranch,
          subject: mergeCommit.message,
          commitOptions: {
            hash: mergeCommit.id,
          },
        });
      } else {
        console.warn(`Could not determine source branch for merge commit ${mergeCommit.id}`);
        targetBranch.commit({
          subject: mergeCommit.message + " (merge)",
          hash: mergeCommit.id,
        });
      }
    });
};

const checkoutActiveBranch = (
  branches: Branch[],
  branchRefs: Record<string, GitgraphBranchApi>
) => {
  const activeBranch = branches.find(b => b.isActive);
  if (activeBranch && branchRefs[activeBranch.name]) {
    console.log(`Active branch set to: ${activeBranch.name}`);
  }
};

// --- Component --- //

interface GitGraphViewerProps {
  repoState: {
    branches: Branch[];
    commits: Commit[];
  };
  gitgraphRef?: React.RefObject<GitgraphApi | null>;
}

const GitGraphViewer: React.FC<GitGraphViewerProps> = ({ repoState, gitgraphRef }) => {
  const { branches, commits } = repoState;
  const internalGitgraphRef = useRef<GitgraphApi | null>(null);

  const customTemplate = templateExtend(TemplateName.Metro, {
    colors: ['#0366d6', '#28a745', '#f9826c', '#6f42c1', '#e36209'],
    branch: {
      lineWidth: 2,
      spacing: 20,
      label: {
        font: "normal 12px Arial",
        bgColor: "#f1f8ff",
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

  if (!branches || !commits) {
    return <div className="git-graph-viewer git-graph-error">Missing branches or commits data.</div>;
  }

  return (
    <div className="git-graph-viewer">
      <GitgraphReact options={{ template: customTemplate }}>
        {(gitgraph: GitgraphApi) => {
          if (gitgraphRef) {
            gitgraphRef.current = gitgraph;
          }
          internalGitgraphRef.current = gitgraph;

          const branchRefs: Record<string, GitgraphBranchApi> = {};
          createBranches(gitgraph, branches, commits, branchRefs);
          addCommits(commits, branchRefs);
          addMerges(commits, branchRefs);
          checkoutActiveBranch(branches, branchRefs);

          return null;
        }}
      </GitgraphReact>
    </div>
  );
};

export default GitGraphViewer;