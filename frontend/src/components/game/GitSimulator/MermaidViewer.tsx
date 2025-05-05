import { useEffect, useRef } from 'react';
import './MermaidViewer.css';

// Tipo para o objeto mermaid global
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
    // Carrega o script Mermaid dinamicamente
    const loadMermaid = async () => {
      if (!window.mermaid) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.0.0/dist/mermaid.min.js';
        script.async = true;
        script.onload = () => {
          initializeMermaid();
        };
        document.body.appendChild(script);
      } else {
        initializeMermaid();
      }
    };

    // Inicializa o mermaid e renderiza o diagrama
    const initializeMermaid = () => {
      if (window.mermaid) {
        try {
          window.mermaid.initialize({
            startOnLoad: true,
            theme: 'default',
            gitGraph: {
              rotateCommitLabel: true,
              showBranches: true
            }
          });

          // Renderizar apenas se o texto do diagrama existe
          if (diagramText && containerRef.current) {
            const container = containerRef.current;
            
            // Limpar container antes de renderizar novo diagrama
            container.innerHTML = '';
            
            // Criar elemento para o Mermaid
            const element = document.createElement('div');
            element.id = mermaidId;
            element.className = 'mermaid';
            element.textContent = diagramText;
            container.appendChild(element);
            
            // Renderizar o diagrama
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
          console.error('Erro ao renderizar diagrama Mermaid:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<div class="mermaid-error">Erro ao renderizar diagrama: ${error}</div>`;
          }
        }
      }
    };

    loadMermaid();
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