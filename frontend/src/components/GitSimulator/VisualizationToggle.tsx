import React from 'react';
import './VisualizationToggle.css';

export type ViewMode = 'mermaid' | 'gitgraph';

interface VisualizationToggleProps {
  viewMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

const VisualizationToggle: React.FC<VisualizationToggleProps> = ({ viewMode, onToggle }) => {
  return (
    <div className="visualization-toggle">
      <button 
        className={`toggle-button ${viewMode === 'mermaid' ? 'active' : ''}`}
        onClick={() => onToggle('mermaid')}
      >
        Mermaid
      </button>
      <button 
        className={`toggle-button ${viewMode === 'gitgraph' ? 'active' : ''}`}
        onClick={() => onToggle('gitgraph')}
      >
        GitGraph.js
      </button>
    </div>
  );
};

export default VisualizationToggle;