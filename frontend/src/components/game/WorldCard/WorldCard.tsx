import { useMemo, useCallback } from 'react';
import './WorldCard.css';
import { useGame } from '../../../hooks/useGame';
import DevTip from '../../ui/DevHelper/DevTip';

export default function WorldCard() {
  const gameState = useGame();
  const { location, move, hasVisited } = gameState;
  
  // Use memoização para evitar recálculos desnecessários
  const circleElements = useMemo(() => {
    return [...Array(10)].map((_, i) => (
      <div 
        key={i} 
        className={`circle ${hasVisited(`mission-${i+1}`) ? 'visited' : ''}`}
      ></div>
    ));
  }, [hasVisited]);
  
  // Use callback para evitar recriação da função
  const handleStartMission = useCallback(() => {
    move('mission-1');
  }, [move]);
  
  return (
    <DevTip 
      componentName="WorldCard"
      description="Exibe os mundos disponíveis e as missões em cada mundo. Os círculos representam missões que o jogador pode completar."
      integrationTip="Deve usar worldApi.getAllWorlds() e questApi.getWorldQuests() para mostrar dados reais do backend."
    >
      <div className="world-card">
        <div className="world-header">
          <h3>card Worldbuilding</h3>
          <div className="world-tabs">
            <div className="tab">Missões</div>
            <div className="tab">Conquistas</div>
          </div>
        </div>
        
        <div className="world-content">
          <div className="card-worldbuilding">
            <div className="circles-container">
              {circleElements}
            </div>
          </div>
          
          <div className="mission-text">
            <p>Current Location: {location}</p>
            <p>Card textos das missões</p>
          </div>
          
          <div className="action-buttons">
            <button className="action-btn" onClick={handleStartMission}>start</button>
            <button className="action-btn">Dica</button>
          </div>
        </div>
      </div>
    </DevTip>
  );
}