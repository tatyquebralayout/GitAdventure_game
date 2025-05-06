import { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import './GitSimulator.css';
import { useGitRepository } from '../../../hooks/useGitRepository';
import VisualizationToggle, { ViewMode } from './VisualizationToggle';
import DevTip from '../../ui/DevHelper/DevTip';
import { GitCommit, GitBranch } from '../../../types/git';

// Lazy load visualization components to reduce initial bundle size
const MermaidViewer = lazy(() => import('./MermaidViewer'));
const GitGraphViewer = lazy(() => import('./GitGraphViewer'));

// Definição dos tipos para arquivos
interface GitFile {
  name: string;
  status: 'untracked' | 'modified' | 'staged'; // Removed 'committed' as it's implicit in history
}

// Function to generate Mermaid diagram text
const generateMermaidDiagram = (commits: GitCommit[], branches: GitBranch[]): string => {
  let diagram = 'graph TD\n'; // Top-down graph

  if (!commits || commits.length === 0) {
    return diagram + '    empty[Repositório Vazio]\n';
  }

  // Map commit ID to a shorter ID for Mermaid
  const commitIdMap = new Map<string, string>();
  // Use commit.id instead of commit.sha
  commits.forEach((commit, index) => commitIdMap.set(commit.id, `C${index}`));

  // Add commits as nodes
  commits.forEach(commit => {
    // Use commit.id instead of commit.sha
    const shortId = commitIdMap.get(commit.id);
    const messageSummary = commit.message.split('\n')[0].substring(0, 30) + (commit.message.length > 30 ? '...' : '');
    // Use commit.id instead of commit.sha
    diagram += `    ${shortId}("${commit.id.substring(0, 7)}: ${messageSummary}")\n`;
  });

  // Add parent links
  commits.forEach(commit => {
    // Use commit.id instead of commit.sha
    const childId = commitIdMap.get(commit.id);
    commit.parents.forEach(parentId => { // Parent IDs are already strings (hashes)
      const parentMermaidId = commitIdMap.get(parentId);
      if (parentMermaidId) {
        diagram += `    ${parentMermaidId} --> ${childId}\n`;
      }
    });
  });

  // Find the latest commit for each branch to point the branch label to it
  const latestCommitPerBranch = new Map<string, string>();
  commits.forEach(commit => {
    // Assuming commit.branch holds the branch name it belongs to
    // This might need adjustment based on how branch association is truly determined
    // For now, we take the last seen commit on a branch as the "latest"
    latestCommitPerBranch.set(commit.branch, commit.id);
  });

  // Add branches pointing to the latest commit on that branch
  branches.forEach(branch => {
    const latestCommitId = latestCommitPerBranch.get(branch.name);
    // Use commit.id (latestCommitId) instead of branch.commitSha
    const commitMermaidId = latestCommitId ? commitIdMap.get(latestCommitId) : undefined;
    if (commitMermaidId) {
      diagram += `    ${branch.name}[${branch.name}] --> ${commitMermaidId}\n`;
      diagram += `    style ${branch.name} fill:#f9f,stroke:#333,stroke-width:2px\n`;
    }
  });

  return diagram;
};


export default function GitSimulator() {
  const [repositoryView, setRepositoryView] = useState<'working' | 'staged' | 'committed'>('working');
  const [viewMode, setViewMode] = useState<ViewMode>('gitgraph');
  // Initialize files as empty, will be populated by status
  const [files, setFiles] = useState<GitFile[]>([]); 
  const [error, setError] = useState<string | null>(null); 
  const [mermaidDiagram, setMermaidDiagram] = useState<string>(''); // State for Mermaid diagram

  const { 
    commits = [], // Default to empty array
    currentBranch,
    branches = [], // Default to empty array
    status,
  } = useGitRepository();
  
  const gitgraphRef = useRef<HTMLDivElement>(null);
  
  // Função para atualizar a lista de arquivos baseada no status do contexto
  const updateFileList = useCallback(() => {
    const updatedFiles: GitFile[] = [];
    setError(null); // Clear errors on update

    if (status) {
      try {
        status.untracked.forEach(filename => {
          updatedFiles.push({ name: filename, status: 'untracked' });
        });
        status.modified.forEach(filename => {
          // Avoid duplicates if a file is both modified and staged (though unlikely with standard git)
          if (!updatedFiles.some(f => f.name === filename)) {
            updatedFiles.push({ name: filename, status: 'modified' });
          }
        });
        status.staged.forEach(filename => {
           // Update existing entry or add new
           const existingIndex = updatedFiles.findIndex(f => f.name === filename);
           if (existingIndex > -1) {
             // If already present (e.g., was modified), update status to staged
             updatedFiles[existingIndex].status = 'staged';
           } else {
             updatedFiles.push({ name: filename, status: 'staged' });
           }
        });
        setFiles(updatedFiles);
      } catch (err) {
        console.error('Erro ao processar status do Git:', err);
        setError('Falha ao processar o status dos arquivos.');
        setFiles([]); // Clear files on error
      }
    } else {
      // Handle case where status is null/undefined
      setFiles([]);
    }
  }, [status]); // Depend only on status

  // Atualizar a lista de arquivos quando o status do repositório mudar
  useEffect(() => {
    updateFileList();
  }, [status, updateFileList]); // Update file list when status changes

  // Generate Mermaid diagram when commits or branches change
  useEffect(() => {
    try {
      // Pass commits and branches correctly
      const diagram = generateMermaidDiagram(commits, branches);
      setMermaidDiagram(diagram);
    } catch (err) {
      console.error('Erro ao gerar diagrama Mermaid:', err);
      setError('Falha ao gerar a visualização do histórico.');
      setMermaidDiagram('graph TD\n    error["Erro ao gerar gráfico"]\n'); // Show error in diagram
    }
    // Depend on commits and branches
  }, [commits, branches]);

  // Handle view mode toggle
  const handleViewModeToggle = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // Adjusted status class function (removed 'committed')
  const getStatusClass = (status: 'untracked' | 'modified' | 'staged') => {
    switch (status) {
      case 'untracked': return 'status-untracked';
      case 'modified': return 'status-modified';
      case 'staged': return 'status-staged';
      default: return '';
    }
  };

  const LoadingFallback = () => (
    <div className="git-loading-fallback">
      Carregando visualização...
    </div>
  );

  // Conversion functions remain simple if GitGraphViewer uses canonical types
  const convertCommitsForViewer = (): GitCommit[] => {
    return commits; 
  };

  const convertBranchesForViewer = (): GitBranch[] => {
    return branches;
  };

  return (
    <DevTip
      componentName="GitSimulator"
      description="Simulador visual de repositório Git, mostrando graficamente branches, commits e status de arquivos."
      integrationTip="Integrado com useGitRepository para obter estado do Git. Comandos são executados através do contexto."
    >
      <div className="git-simulator card">
        <div className="git-header">
          <h3>simulador git</h3>
        </div>
        
        {error && (
          <div className="git-error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="git-content">
          <div className="git-tabs">
            <button 
              className={`git-tab-button ${repositoryView === 'working' ? 'active' : ''}`}
              onClick={() => {
                setRepositoryView('working');
              }}
            >
              Working Directory
            </button>
            <button 
              className={`git-tab-button ${repositoryView === 'staged' ? 'active' : ''}`}
              onClick={() => {
                setRepositoryView('staged');
              }}
            >
              Staging Area
            </button>
            <button 
              className={`git-tab-button ${repositoryView === 'committed' ? 'active' : ''}`}
              onClick={() => {
                setRepositoryView('committed');
              }}
            >
              Local Repository (History)
            </button>
          </div>
          
          <div className="git-files-container">
            {repositoryView === 'committed' ? (
              <div className="git-graph-view">
                <VisualizationToggle viewMode={viewMode} onToggle={handleViewModeToggle} />
                
                <Suspense fallback={<LoadingFallback />}>
                  {viewMode === 'mermaid' 
                    ? <MermaidViewer diagramText={mermaidDiagram} /> 
                    : <GitGraphViewer 
                        repoState={{ 
                          branches: convertBranchesForViewer(),
                          commits: convertCommitsForViewer(),
                        }}
                        gitgraphRef={gitgraphRef}
                      />
                  }
                </Suspense>
              </div>
            ) : (
              <div className="git-file-list">
                {files.filter(file => {
                  if (repositoryView === 'working') return file.status === 'untracked' || file.status === 'modified';
                  if (repositoryView === 'staged') return file.status === 'staged';
                  return false; 
                }).map((file, index) => (
                  <div key={index} className={`git-file ${getStatusClass(file.status)}`}>
                    <span className="file-name">{file.name}</span>
                    <span className="file-status">{file.status}</span>
                  </div>
                ))}
                {(repositoryView === 'working' || repositoryView === 'staged') && files.filter(file => {
                    if (repositoryView === 'working') return file.status === 'untracked' || file.status === 'modified';
                    if (repositoryView === 'staged') return file.status === 'staged';
                    return false;
                  }).length === 0 && (
                  <div className="git-file-list-empty">
                    {repositoryView === 'working' ? 'Nenhuma alteração no diretório de trabalho.' : 'Nenhuma alteração na área de staging.'}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="git-info">
            <div className="git-branch-info">
              <span className="branch-label">Current Branch:</span>
              <span className="branch-name">{currentBranch || 'N/A'}</span>
            </div>
            <div className="git-commit-count">
              <span className="commit-label">Commits:</span>
              <span className="commit-number">{commits.length}</span>
            </div>
          </div>
        </div>
      </div>
    </DevTip>
  );
}