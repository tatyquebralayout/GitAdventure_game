import { useEffect, useRef } from 'react';
import './MermaidViewer.css';

declare global {
  interface Window {
    mermaid: {
      initialize: (config: MermaidConfig) => void;
      render: (id: string, text: string, callback: (svgCode: string) => void) => void;
    }
  }
}

interface MermaidConfig {
  startOnLoad?: boolean;
  theme?: string;
  gitGraph?: {
    rotateCommitLabel?: boolean;
    showBranches?: boolean;
  };
  [key: string]: unknown;
}

interface MermaidViewerProps {
  diagramText: string;
}

const MermaidViewer: React.FC<MermaidViewerProps> = ({ diagramText }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidId = `mermaid-${Math.random().toString(36).substring(2, 15)}`;

  useEffect(() => {
    const loadMermaid = () => {
      if (!window.mermaid) {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.0.0/dist/mermaid.min.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Mermaid'));
          document.body.appendChild(script);
        });
      }
      return Promise.resolve();
    };

    const initializeMermaid = async () => {
      try {
        await loadMermaid();
        if (!window.mermaid) return;

        window.mermaid.initialize({
          startOnLoad: true,
          theme: 'default',
          gitGraph: {
            rotateCommitLabel: true,
            showBranches: true
          }
        });

        // Only render if diagram text exists and container is available
        if (diagramText && containerRef.current) {
          const container = containerRef.current;
          container.innerHTML = '';
          
          const element = document.createElement('div');
          element.id = mermaidId;
          element.className = 'mermaid';
          element.textContent = diagramText;
          container.appendChild(element);

          window.mermaid.render(
            `svg-${mermaidId}`,
            diagramText,
            (svgCode) => {
              if (container) {
                container.innerHTML = svgCode;
              }
            }
          );
        }
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="mermaid-error">Error rendering diagram: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
        }
      }
    };

    void initializeMermaid();
  }, [diagramText, mermaidId]);

  return (
    <div className="mermaid-viewer">
      <div ref={containerRef} className="mermaid-container">
        {!diagramText && (
          <div className="mermaid-empty">
            Nenhum diagrama para exibir.
            Use comandos Git para criar um histórico de commits.
          </div>
        )}
      </div>
    </div>
  );
};

export default MermaidViewer;