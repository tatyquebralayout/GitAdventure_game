import React from 'react';
import './DevTip.css';

interface DevTipProps {
  componentName: string;
  description: string;
  integrationTip: string;
  children: React.ReactNode;
}

/**
 * Componente de dica para desenvolvimento que envolve outros componentes
 * e mostra informações úteis sobre seu propósito e integração
 */
const DevTip: React.FC<DevTipProps> = ({ 
  componentName, 
  description, 
  integrationTip,
  children 
}) => {
  const [showTip, setShowTip] = React.useState(false);

  return (
    <div className="dev-tip-container">
      <div className="dev-tip-badge" onClick={() => setShowTip(!showTip)}>
        ?
      </div>
      
      {showTip && (
        <div className="dev-tip-popup">
          <h3>{componentName}</h3>
          <p className="dev-tip-description">{description}</p>
          <div className="dev-tip-integration">
            <strong>Integração:</strong> {integrationTip}
          </div>
          <button 
            className="dev-tip-close" 
            onClick={() => setShowTip(false)}
          >
            Fechar
          </button>
        </div>
      )}
      
      {children}
    </div>
  );
};

export default DevTip; 