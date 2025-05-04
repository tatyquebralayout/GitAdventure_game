import './WorldCard.css';
import { useGame } from '../../hooks/useGame';

export default function WorldCard() {
  const { location, move, hasVisited } = useGame();
  
  const handleStartMission = () => {
    // Example of using the state management to move to a new location
    move('mission-1');
  };
  
  return (
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
            {[...Array(10)].map((_, i) => (
              <div 
                key={i} 
                className={`circle ${hasVisited(`mission-${i+1}`) ? 'visited' : ''}`}
              ></div>
            ))}
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
  );
}