import { useEffect, useState } from 'react';
import { Gitgraph, templateExtend, TemplateName } from '@gitgraph/react';
import type { GitgraphOptions, GitgraphApi, GitgraphBranchApi } from '@gitgraph/react';
import './GitGraph.css';
import { GitCommit, GitBranch } from '../../../types/git';

// Define the structure for each commit in our history
// Remover definição local, agora importada de '../../../types/git'
// export interface GitCommit { ... }

// Define the structure for branch information
// Remover definição local, agora importada de '../../../types/git'
// export interface GitBranch { ... }

interface GitGraphProps {
  commits: GitCommit[]; // Usar tipo importado
  branches: GitBranch[]; // Usar tipo importado
}

export default function GitGraph({ commits, branches }: GitGraphProps) {
  const [activeCommits, setActiveCommits] = useState<GitCommit[]>(commits); // Usar tipo importado
  const [activeBranches, setActiveBranches] = useState<GitBranch[]>(branches); // Usar tipo importado

  // Update state when props change
  useEffect(() => {
    setActiveCommits(commits);
    setActiveBranches(branches);
  }, [commits, branches]);

  // Customize the template
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
      },
    },
  });

  // Options for the graph
  const options: GitgraphOptions = { template: customTemplate };

  return (
    <div className="git-graph-container">
      {/* Ensure the options prop matches the expected type */}
      <Gitgraph options={options}>
        {(gitgraph: GitgraphApi) => {
          // Create branches and commits based on our state
          const branchMap = new Map<string, GitgraphBranchApi>();
          
          // First, create all branches
          activeBranches.forEach((branch) => {
            branchMap.set(branch.name, gitgraph.branch(branch.name));
          });
          
          // Then, process all commits in order
          activeCommits.forEach((commit) => {
            // Get the branch for this commit
            const branch = branchMap.get(commit.branch);
            
            if (branch) {
              branch.commit({
                subject: commit.message,
                hash: commit.id, // Ajustado para usar a propriedade 'id' do tipo unificado
                style: {
                  // Highlight the active branch's commits
                  dot: activeBranches.find(b => b.name === commit.branch && b.isActive)
                    ? { color: "#ff9500" } 
                    : undefined,
                },
              });
            }
          });

          // Set HEAD to the active branch
          const activeBranch = activeBranches.find(b => b.isActive);
          if (activeBranch) {
            const branch = branchMap.get(activeBranch.name);
            if (branch) {
              // No direct way to show HEAD, but we could customize the last commit
              // or use branch name styling to indicate the active branch
            }
          }
          
          // Retornando null explicitamente para satisfazer o requisito de ReactNode
          return null;
        }}
      </Gitgraph>
    </div>
  );
}