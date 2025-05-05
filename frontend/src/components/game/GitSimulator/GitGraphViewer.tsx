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
    // Carrega o script GitgraphJS dinamicamente
    const loadGitgraphJS = async () => {
      if (!window.GitgraphJS) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@gitgraph/js';
        script.async = true;
        script.onload = () => {
          renderGitGraph();
        };
        document.body.appendChild(script);
      } else {
        renderGitGraph();
      }
    };

    // Renderiza o gráfico Git usando a biblioteca Gitgraph.js
    const renderGitGraph = () => {
      if (!window.GitgraphJS) {
        console.error('Gitgraph.js não está carregado');
        return;
      }

      // Usar a referência fornecida ou a referência local
      const element = (gitgraphRef?.current || localGitgraphRef.current);
      
      if (!element) {
        console.error('Elemento para renderizar Gitgraph não encontrado');
        return;
      }

      // Limpar conteúdo antes de renderizar
      element.innerHTML = '';

      try {
        // Criar gráfico Git com opções personalizadas
        const gitgraph = window.GitgraphJS.createGitgraph(element, {
          author: 'Jogador <player@gitadventure.com>',
          template: {
            colors: ['#6963FF', '#47E8D4', '#6BDB52', '#E84BA5', '#FFA657'],
            branch: {
              lineWidth: 3,
              spacing: 40,
              label: {
                font: 'normal 12pt Arial',
                color: '#333'
              }
            },
            commit: {
              spacing: 50,
              dot: {
                size: 8,
                strokeWidth: 2
              },
              message: {
                font: 'normal 11pt Arial',
                color: '#444'
              }
            }
          }
        });

        // Se não houver commits, mostrar um commit inicial exemplo
        if (repoState.commits.length === 0) {
          const mainBranch = gitgraph.branch('main');
          mainBranch.commit('Commit inicial será mostrado aqui');
          return;
        }

        // Mapear branches para objetos Gitgraph
        const gitgraphBranches: Record<string, GitgraphBranch> = {};
        
        // Criar todos os branches primeiro
        repoState.branches.forEach((branch: GitBranch) => {
          gitgraphBranches[branch.name] = gitgraph.branch(branch.name);
        });

        // Cria o branch main se não existir
        if (!gitgraphBranches['main']) {
          gitgraphBranches['main'] = gitgraph.branch('main');
        }

        // Ordenar commits por data para exibir na ordem correta
        const sortedCommits = [...repoState.commits].sort(
          (a: GitCommit, b: GitCommit) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        // Renderizar commits
        sortedCommits.forEach((commit: GitCommit) => {
          // Obter ou criar o branch correto para o commit
          const branch = gitgraphBranches[commit.branch] || gitgraphBranches['main'];
          
          // Verificar se é um merge commit (mais de um parent)
          if (commit.parents.length > 1) {
            // Identificar o branch de origem do merge
            const sourceCommit = repoState.commits.find(c => c.id === commit.parents[1]);
            const sourceBranchName = sourceCommit?.branch;

            if (sourceBranchName && gitgraphBranches[sourceBranchName]) {
              // Realizar o merge
              branch.merge({
                branch: gitgraphBranches[sourceBranchName],
                commitOptions: {
                  subject: commit.message,
                  author: commit.author,
                  hash: commit.id.substring(0, 7)
                }
              });
            } else {
              // Fallback para commit normal se não encontrar o branch de origem
              branch.commit({
                subject: `${commit.message} (merge)`,
                author: commit.author,
                hash: commit.id.substring(0, 7)
              });
            }
          } else {
            // Commit normal
            branch.commit({
              subject: commit.message,
              author: commit.author,
              hash: commit.id.substring(0, 7)
            });
          }
        });
      } catch (error) {
        console.error('Erro ao renderizar GitGraph:', error);
        if (element) {
          element.innerHTML = `<div class="gitgraph-error">Erro ao renderizar o gráfico: ${error}</div>`;
        }
      }
    };

    loadGitgraphJS();
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