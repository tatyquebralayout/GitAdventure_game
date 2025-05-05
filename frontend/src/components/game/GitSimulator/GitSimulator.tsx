import { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import './GitSimulator.css';
import { useGitRepository } from '../../../hooks/useGitRepository';
import VisualizationToggle, { ViewMode } from './VisualizationToggle';
import DevTip from '../../ui/DevHelper/DevTip';
import { GitCommit, GitBranch, GitStatus } from '../../../types/git';

// Lazy load visualization components to reduce initial bundle size
const MermaidViewer = lazy(() => import('./MermaidViewer'));
const GitGraphViewer = lazy(() => import('./GitGraphViewer'));

// Definição dos tipos para arquivos
interface GitFile {
  name: string;
  status: 'untracked' | 'modified' | 'staged' | 'committed';
}

export default function GitSimulator() {
  const [repositoryView, setRepositoryView] = useState<'working' | 'staged' | 'committed'>('working');
  const [viewMode, setViewMode] = useState<ViewMode>('gitgraph');
  const [files, setFiles] = useState<GitFile[]>([
    { name: 'README.md', status: 'untracked' },
    { name: 'index.js', status: 'untracked' }
  ]);
  const [error, setError] = useState<string | null>(null); // Add error state
  
  // Use the context hook which now provides state conforming to GitRepositoryState
  const { 
    commits, 
    currentBranch,
    branches, // Add branches if needed for visualization
    status,
    executeCommand: executeGitCommand
  } = useGitRepository();
  
  // Referência para o gitgraphRef
  const gitgraphRef = useRef<HTMLDivElement>(null);
  
  // Função para atualizar a lista de arquivos
  const updateFileList = useCallback(() => {
    const updatedFiles: GitFile[] = [];
    
    // Use the status object from context (already conforms to GitStatus)
    if (status) {
      status.untracked.forEach(filename => {
        updatedFiles.push({ name: filename, status: 'untracked' });
      });
      
      // Obter arquivos modificados
      status.modified.forEach(filename => {
        updatedFiles.push({ name: filename, status: 'modified' });
      });
      
      // Obter arquivos no staged
      status.staged.forEach(filename => {
        updatedFiles.push({ name: filename, status: 'staged' });
      });
    }
    
    // Use commits from context (already conforms to GitCommit[])
    if (commits && commits.length > 0) {
      const mostRecentCommit = commits[0];
      if (mostRecentCommit && mostRecentCommit.message) {
        // Extrair nomes de arquivos da mensagem de commit (simulação simplificada)
        const commitMessage = mostRecentCommit.message.toLowerCase();
        
        // Simulação simples para detectar arquivos commitados
        ['app.js', 'style.css', 'index.html', 'README.md'].forEach(filename => {
          if (commitMessage.includes(filename.toLowerCase()) && 
              !updatedFiles.some(file => file.name === filename)) {
            updatedFiles.push({ name: filename, status: 'committed' });
          }
        });
      }
    }
    
    setFiles(updatedFiles);
  }, [commits, status]);
  
  // Função para atualizar a visualização Git
  const updateGitVisualization = useCallback(async () => { // Make async
    setError(null); // Clear previous errors
    try {
      // Atualizar arquivos
      updateFileList();
      
      // Recarregar visualização de commits se disponível
      await executeGitCommand('git status'); // Await the command
    } catch (err) {
      console.error('Erro ao atualizar visualização Git:', err);
      // Set user-friendly error message
      setError('Falha ao atualizar o status do repositório Git. Verifique sua conexão ou tente novamente.'); 
    }
  }, [updateFileList, executeGitCommand]);
  
  // Atualizar o estado dos arquivos quando o status do repositório mudar
  useEffect(() => {
    if (commits) {
      updateFileList();
    }
  }, [commits, status, updateFileList]);
  
  // Atualizar quando o contexto do repositório git mudar
  useEffect(() => {
    updateFileList();
  }, [status, updateFileList]);
  
  // Atualizar periodicamente para manter visualizações sincronizadas
  useEffect(() => {
    // Atualizar na inicialização
    updateGitVisualization();
    
    // Configurar intervalo para atualização periódica
    const intervalId = setInterval(() => {
      updateGitVisualization();
    }, 5000); // Atualizar a cada 5 segundos
    
    // Limpar intervalo quando o componente for desmontado
    return () => clearInterval(intervalId);
  }, [updateGitVisualization]);
  
  // Handle view mode toggle
  const handleViewModeToggle = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const getStatusClass = (status: 'untracked' | 'modified' | 'staged' | 'committed') => {
    switch (status) {
      case 'untracked': return 'status-untracked';
      case 'modified': return 'status-modified';
      case 'staged': return 'status-staged';
      case 'committed': return 'status-committed';
      default: return '';
    }
  };

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="git-loading-fallback">
      Carregando visualização...
    </div>
  );

  // Converter GitCommit para o formato esperado por GitGraphViewer if necessary
  // If GitGraphViewer is updated to use GitCommit directly, this might be simpler
  const convertCommitsForViewer = (): GitCommit[] => {
    // Assuming GitGraphViewer now uses the canonical GitCommit type
    return commits; 
    // If GitGraphViewer still expects a different format, adapt here:
    // return commits.map(commit => ({ ...commit, /* any necessary transformations */ }));
  };

  // Prepare branches for the viewer if needed
  const convertBranchesForViewer = (): GitBranch[] => {
    // Assuming GitGraphViewer uses the canonical GitBranch type
    return branches || [];
  };

  return (
    <DevTip
      componentName="GitSimulator"
      description="Simulador visual de repositório Git, mostrando graficamente branches, commits e status de arquivos."
      integrationTip="Deve ser integrado com commandApi para executar comandos Git reais e persistir o estado no backend."
    >
      <div className="git-simulator card">
        <div className="git-header">
          <h3>simulador git</h3>
        </div>
        
        {/* Display error message if present */}
        {error && (
          <div className="git-error-message">
            <p>{error}</p>
          </div>
        )}
        
        <div className="git-content">
          <div className="git-tabs">
            <button 
              className={`git-tab-button ${repositoryView === 'working' ? 'active' : ''}`}
              onClick={() => setRepositoryView('working')}
            >
              Working Directory
            </button>
            <button 
              className={`git-tab-button ${repositoryView === 'staged' ? 'active' : ''}`}
              onClick={() => setRepositoryView('staged')}
            >
              Staging Area
            </button>
            <button 
              className={`git-tab-button ${repositoryView === 'committed' ? 'active' : ''}`}
              onClick={() => setRepositoryView('committed')}
            >
              Local Repository
            </button>
          </div>
          
          <div className="git-files-container">
            {/* Toggle between file list and graph view */}
            {repositoryView === 'committed' ? (
              <div className="git-graph-view">
                <VisualizationToggle viewMode={viewMode} onToggle={handleViewModeToggle} />
                
                <Suspense fallback={<LoadingFallback />}>
                  {viewMode === 'mermaid' 
                    ? <MermaidViewer diagramText="" /> // Mermaid might need specific formatting
                    : <GitGraphViewer 
                        repoState={{ 
                          // Pass branches and commits conforming to types/git.ts
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
                  if (repositoryView === 'committed') return file.status === 'committed';
                  return true;
                }).map((file, index) => (
                  <div key={index} className={`git-file ${getStatusClass(file.status)}`}>
                    <span className="file-name">{file.name}</span>
                    <span className="file-status">{file.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="git-info">
            <div className="git-branch-info">
              <span className="branch-label">Current Branch:</span>
              <span className="branch-name">{currentBranch}</span>
            </div>
            <div className="git-commit-count">
              <span className="commit-label">Commits:</span>
              <span className="commit-number">{commits ? commits.length : 0}</span>
            </div>
          </div>
        </div>
      </div>
    </DevTip>
  );
}