import { useState } from 'react';
import './GitSimulator.css';

interface GitFile {
  name: string;
  status: 'untracked' | 'modified' | 'staged' | 'committed';
}

export default function GitSimulator() {
  const [files, setFiles] = useState<GitFile[]>([
    { name: 'index.html', status: 'untracked' },
    { name: 'style.css', status: 'modified' },
    { name: 'app.js', status: 'staged' }
  ]);

  const [repositoryView, setRepositoryView] = useState<'working' | 'staged' | 'committed'>('working');
  
  const handleFileStatusChange = (fileName: string, newStatus: GitFile['status']) => {
    setFiles(files.map(file => 
      file.name === fileName ? { ...file, status: newStatus } : file
    ));
  };

  const getStatusClass = (status: GitFile['status']) => {
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
        </div>
        
        <div className="git-commands">
          <button className="git-command-button" onClick={() => {
            // Simulating git add command
            const selectedFile = files.find(f => f.status === 'untracked' || f.status === 'modified');
            if (selectedFile) {
              handleFileStatusChange(selectedFile.name, 'staged');
            }
          }}>
            git add
          </button>
          
          <button className="git-command-button" onClick={() => {
            // Simulating git commit command
            const stagedFiles = files.filter(f => f.status === 'staged');
            stagedFiles.forEach(file => {
              handleFileStatusChange(file.name, 'committed');
            });
          }}>
            git commit
          </button>
          
          <button className="git-command-button">
            git push
          </button>
        </div>
      </div>
    </div>
  );
}