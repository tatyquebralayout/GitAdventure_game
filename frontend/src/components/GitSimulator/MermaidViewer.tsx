import React, { useEffect, useState } from 'react';
import { MermaidDiagram } from '@lightenna/react-mermaid-diagram';
import mermaid from 'mermaid';
import './MermaidViewer.css';

interface MermaidViewerProps {
  diagramText: string;
}

const MermaidViewer: React.FC<MermaidViewerProps> = ({ diagramText }) => {
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Basic validation: check if diagramText is not empty
    if (diagramText && diagramText.trim() !== '') {
      try {
        // More robust validation could involve mermaid.parse(), but it's asynchronous
        // and might be overkill. For now, just check if it's non-empty.
        mermaid.initialize({ startOnLoad: false });
        setIsValid(true);
      } catch (error) {
        console.error("Failed to initialize Mermaid or validate diagram:", error);
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  }, [diagramText]); // Re-run validation if diagramText changes

  if (!isValid) {
    // Optionally render a placeholder or error message
    return <div className="mermaid-viewer mermaid-invalid">Invalid or empty diagram text.</div>;
  }

  return (
    <div className="mermaid-viewer">
      {/* Consider adding an Error Boundary component around MermaidDiagram
          for more robust error handling during rendering */}
      <MermaidDiagram>{diagramText}</MermaidDiagram>
    </div>
  );
};

export default MermaidViewer;