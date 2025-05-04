import React, { useEffect } from 'react';
import { MermaidDiagram } from '@lightenna/react-mermaid-diagram';
import mermaid from 'mermaid';
import './MermaidViewer.css';

interface MermaidViewerProps {
  diagramText: string;
}

const MermaidViewer: React.FC<MermaidViewerProps> = ({ diagramText }) => {
  useEffect(() => {
    // Initialize mermaid with startOnLoad: false to prevent automatic rendering
    mermaid.initialize({ startOnLoad: false });
  }, []);

  return (
    <div className="mermaid-viewer">
      <MermaidDiagram>{diagramText}</MermaidDiagram>
    </div>
  );
};

export default MermaidViewer;