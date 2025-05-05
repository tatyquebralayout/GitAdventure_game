import React from 'react';
import './VisualizationToggle.css';

export type ViewMode = 'mermaid' | 'gitgraph';

interface VisualizationToggleProps {
  viewMode: ViewMode;
  onToggle: (newMode: ViewMode) => void;
}

const VisualizationToggle: React.FC<VisualizationToggleProps> = ({
  viewMode,
  onToggle
}) => {
  return (
    <div className="visualization-toggle">
      <div className="toggle-container">
        <button
          className={`toggle-button ${viewMode === 'gitgraph' ? 'active' : ''}`}
          onClick={() => onToggle('gitgraph')}
          title="Visualização em gráfico"
        >
          Gráfico
        </button>
        <button
          className={`toggle-button ${viewMode === 'mermaid' ? 'active' : ''}`}
          onClick={() => onToggle('mermaid')}
          title="Visualização em diagrama"
        >
          Diagrama
        </button>
      </div>
      <div className="toggle-info">
        {viewMode === 'mermaid' ? (
          <span className="toggle-description">
            Modo Mermaid: Visualização mais simplificada do histórico Git
          </span>
        ) : (
          <span className="toggle-description">
            Modo Gráfico: Visualização completa do histórico Git
          </span>
        )}
      </div>
    </div>
  );
};

export default VisualizationToggle;