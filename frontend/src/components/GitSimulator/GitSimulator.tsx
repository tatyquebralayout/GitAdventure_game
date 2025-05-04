import { useState } from 'react';
import './GitSimulator.css';
import GitGraph from '../GitGraph/GitGraph';
import { useGitRepository } from '../../contexts/GitRepositoryContext';

export default function GitSimulator() {
  const [repositoryView, setRepositoryView] = useState<'working' | 'staged' | 'committed'>('working');
  
  // Use the Git repository context
  const { commits, branches, files, currentBranch } = useGitRepository();

  const getStatusClass = (status: 'untracked' | 'modified' | 'staged' | 'committed') => {
    switch (status) {
      case 'untracked': return 'status-untracked';
      case 'modified': return 'status-modified';
      case 'staged': return 'status-staged';
      case 'committed': return 'status-committed';
      default: return '';
    }
  };

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
              <GitGraph commits={commits} branches={branches} />
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