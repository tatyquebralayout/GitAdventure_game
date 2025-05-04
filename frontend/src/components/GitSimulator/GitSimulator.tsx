import { useState, useEffect, lazy, Suspense } from 'react';
import './GitSimulator.css';
import { useGitRepository } from '../../contexts/GitRepositoryContext';
import { useGitRepo } from '../../contexts/GitRepoContext';
import VisualizationToggle, { ViewMode } from './VisualizationToggle';

// Lazy load visualization components to reduce initial bundle size
const MermaidViewer = lazy(() => import('./MermaidViewer'));
const GitGraphViewer = lazy(() => import('./GitGraphViewer'));

declare global {
  interface Window {
    executeGitCommand: (command: string) => Promise<unknown>;
  }
}

export default function GitSimulator() {
  const [repositoryView, setRepositoryView] = useState<'working' | 'staged' | 'committed'>('working');
  const [viewMode, setViewMode] = useState<ViewMode>('gitgraph');
  
  // Use both Git repository contexts
  const { 
    commits, 
    files, 
    currentBranch, 
    executeCommand: executeGitRepositoryCommand 
  } = useGitRepository();
  
  // Use the new GitRepoContext for Mermaid integration
  const { 
    mermaidLines, 
    gitgraphRef, 
    branches: gitRepoBranches, 
    commits: gitRepoCommits,
    executeCommand: executeGitRepoCommand 
  } = useGitRepo();
  
  const diagramText = mermaidLines.join('\n');
  
  // Keep contexts in sync
  useEffect(() => {
    // Add a listener to intercept terminal commands
    const originalExecuteCommand = window.executeGitCommand;
    
    window.executeGitCommand = async (command: string) => {
      // Execute in both contexts to keep them in sync
      await executeGitRepoCommand(command);
      const gitRepositoryResult = await executeGitRepositoryCommand(command);
      
      // Return result from the original context for backward compatibility
      return gitRepositoryResult;
    };
    
    return () => {
      // Clean up by restoring original function
      window.executeGitCommand = originalExecuteCommand;
    };
  }, [executeGitRepoCommand, executeGitRepositoryCommand]);
  
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

  return (
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
                  ? <MermaidViewer diagramText={diagramText} />
                  : <GitGraphViewer 
                      repoState={{ 
                        branches: gitRepoBranches, 
                        commits: gitRepoCommits
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
            <span className="commit-number">{commits.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}