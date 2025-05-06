import { useEffect, useRef } from 'react';
import './GitGraphViewer.css';
import { GitCommit, GitBranch } from '../../../types/git'; // Import canonical Git types

// Tipagem para a biblioteca Gitgraph.js
declare global {
  interface Window {
    GitgraphJS: {
      createGitgraph: (element: HTMLElement, options?: GitgraphOptions) => GitgraphInstance;
    }
  }
}

// Adicione estas interfaces acima da declaração global
interface GitgraphOptions {
  author?: string;
  template?: Record<string, unknown>;
}

interface GitgraphInstance {
  branch: (name: string) => GitgraphBranch;
}

interface GitgraphBranch {
  commit: (options: string | Record<string, unknown>) => GitgraphBranch;
  merge: (options: {branch: GitgraphBranch; commitOptions?: Record<string, unknown>}) => GitgraphBranch;
}

// Update GitRepoState to use canonical types
interface GitRepoState {
  branches: GitBranch[]; // Use imported canonical type
  commits: GitCommit[]; // Use imported canonical type
}

interface GitGraphViewerProps {
  repoState: GitRepoState;
  gitgraphRef?: React.RefObject<HTMLDivElement>;
}

const GitGraphViewer: React.FC<GitGraphViewerProps> = ({ repoState, gitgraphRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const localGitgraphRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGitgraphJS = () => {
      if (!window.GitgraphJS) {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@gitgraph/js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load GitgraphJS'));
          document.body.appendChild(script);
        });
      }
      return Promise.resolve();
    };

    const initializeGraph = async () => {
      try {
        await loadGitgraphJS();
        if (!containerRef.current) return;
        const element = localGitgraphRef.current;
        if (!element) return;

        // Clear previous content
        element.innerHTML = '';

        if (repoState.commits.length === 0) {
          element.innerHTML = `<div class="gitgraph-empty">Repositório vazio</div>`;
          return;
        }

        const gitgraph = window.GitgraphJS.createGitgraph(element, {
          author: 'Player <player@gitadventure.com>',
          template: {
            colors: ['#979797'],
            branch: {
              lineWidth: 2,
              spacing: 20,
              label: {
                font: 'normal 10px sans-serif',
                bgColor: '#f1f8ff'
              }
            },
            commit: {
              spacing: 30,
              message: {
                font: 'normal 10px sans-serif'
              }
            }
          }
        });

        // Create branches and commits
        const branches = new Map();

        repoState.branches.forEach(branch => {
          branches.set(branch.name, gitgraph.branch(branch.name));
        });

        repoState.commits.forEach(commit => {
          const branch = branches.get(commit.branch);
          if (branch) {
            branch.commit({
              hash: commit.id.substring(0, 7)
            });
          }
        });
      } catch (error) {
        console.error('Error rendering GitGraph:', error);
        if (localGitgraphRef.current) {
          localGitgraphRef.current.innerHTML = `<div class="gitgraph-error">Error rendering graph: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
        }
      }
    };

    void initializeGraph();
  }, [repoState, gitgraphRef]);

  return (
    <div className="gitgraph-viewer" ref={containerRef}>
      <div 
        ref={localGitgraphRef} 
        className="gitgraph-container"
      />
      {repoState.commits.length === 0 && (
        <div className="gitgraph-empty-message">
          Nenhum commit para mostrar. Use comandos Git para criar commits.
        </div>
      )}
    </div>
  );
};

export default GitGraphViewer;