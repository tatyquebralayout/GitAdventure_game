import './WorldCard.css';

export default function WorldCard() {
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
              <div key={i} className="circle"></div>
            ))}
          </div>
        </div>
        
        <div className="mission-text">
          <p>Card textos das missões</p>
        </div>
        
        <div className="action-buttons">
          <button className="action-btn">start</button>
          <button className="action-btn">Dica</button>
        </div>
      </div>
    </div>
  );
}