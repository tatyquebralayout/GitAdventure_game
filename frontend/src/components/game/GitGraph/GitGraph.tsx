import { useEffect, useState } from 'react';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';
import type { GitgraphOptions, GitgraphApi, GitgraphBranchApi } from '@gitgraph/react';
import './GitGraph.css';
import { GitCommit, GitBranch } from '../../../types/git';

interface GitGraphProps {
  commits: GitCommit[];
  branches: GitBranch[];
}

export default function GitGraph({ commits, branches }: GitGraphProps) {
  const [activeCommits, setActiveCommits] = useState<GitCommit[]>(commits);
  const [activeBranches, setActiveBranches] = useState<GitBranch[]>(branches);

  useEffect(() => {
    setActiveCommits(commits);
    setActiveBranches(branches);
  }, [commits, branches]);

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
      },
    },
  });

  const options: GitgraphOptions = { template: customTemplate };

  return (
    <div className="git-graph-container">
      <Gitgraph options={options}>
        {(gitgraph: GitgraphApi) => {
          const branchMap = new Map<string, GitgraphBranchApi>();
          
          activeBranches.forEach((branch: GitBranch) => {
            branchMap.set(branch.name, gitgraph.branch(branch.name));
          });
          
          activeCommits.forEach((commit: GitCommit) => {
            const branch = branchMap.get(commit.branch);
            
            if (branch) {
              branch.commit({
                subject: commit.message,
                hash: commit.id,
                style: {
                  dot: activeBranches.find((b: GitBranch) => b.name === commit.branch && b.isActive)
                    ? { color: "#ff9500" } 
                    : undefined,
                },
              });
            }
          });

          const activeBranch = activeBranches.find(b => b.isActive);
          if (activeBranch) {
            const branch = branchMap.get(activeBranch.name);
            if (branch) {
              // No direct way to show HEAD, but we could customize the last commit
              // or use branch name styling to indicate the active branch
            }
          }
          
          return null;
        }}
      </Gitgraph>
    </div>
  );
}