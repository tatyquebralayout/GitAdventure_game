import { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
import './GitSimulator.css';
import { useGitRepository } from '../../../hooks/useGitRepository';
import VisualizationToggle, { ViewMode } from './VisualizationToggle';
import DevTip from '../../ui/DevHelper/DevTip';
import { GitCommit } from '../../../types/git';

// Lazy load visualization components to reduce initial bundle size
const MermaidViewer = lazy(() => import('./MermaidViewer'));
const GitGraphViewer = lazy(() => import('./GitGraphViewer'));

// Definição dos tipos para arquivos
interface GitFile {
  name: string;
  status: 'untracked' | 'modified' | 'staged' | 'committed';
}

// Adicionar tipos ao window global para executeGitCommand
declare global {
  interface Window {
    executeGitCommand: (command: string) => Promise<unknown>;
  }
}

export default function GitSimulator() {
  const [repositoryView, setRepositoryView] = useState<'working' | 'staged' | 'committed'>('working');
  const [viewMode, setViewMode] = useState<ViewMode>('gitgraph');
  const [files, setFiles] = useState<GitFile[]>([
    { name: 'README.md', status: 'untracked' },
    { name: 'index.js', status: 'untracked' }
  ]);
  
  // Use both Git repository contexts
  const { 
    commits, 
    currentBranch,
    status,
    executeCommand: executeGitCommand
  } = useGitRepository();
  
  // Referência para o gitgraphRef
  const gitgraphRef = useRef<HTMLDivElement>(null);
  
  // Função para atualizar a lista de arquivos
  const updateFileList = useCallback(() => {
    const updatedFiles: GitFile[] = [];
    
    // Obter status do repositório principal
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
    
    // Para arquivos commitados, usar commits mais recentes
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
  const updateGitVisualization = useCallback(() => {
    // Atualizar arquivos
    updateFileList();
    
    // Recarregar visualização de commits se disponível
    executeGitCommand('git status').catch(error => 
      console.error('Erro ao atualizar visualização Git:', error)
    );
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
  
  // Keep contexts in sync
  useEffect(() => {
    const originalExecuteCommand = window.executeGitCommand;
    window.executeGitCommand = executeGitCommand;

    return () => {
      window.executeGitCommand = originalExecuteCommand; // Limpar ao desmontar
    };
  }, [executeGitCommand]);
  
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

  // Converter GitCommit para GraphViewerCommit
  const convertCommits = (): GitCommit[] => {
    return commits.map(commit => ({
      id: commit.id || '',
      message: commit.message || '',
      author: commit.author || '',
      branch: 'main',
      parents: [],
      date: new Date(commit.date || new Date())
    }));
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
                    ? <MermaidViewer diagramText="" />
                    : <GitGraphViewer 
                        repoState={{ 
                          branches: [],
                          commits: convertCommits(),
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