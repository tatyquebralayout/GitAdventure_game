import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3>Git Adventure</h3>
          <p>Uma plataforma interativa para aprender Git e controle de versão de forma divertida.</p>
        </div>
        
        <div className="footer-section links">
          <h3>Links Úteis</h3>
          <ul>
            <li><a href="#">Início</a></li>
            <li><a href="#">Sobre</a></li>
            <li><a href="#">Tutorial</a></li>
            <li><a href="#">Contato</a></li>
          </ul>
        </div>
        
        <div className="footer-section sponsors">
          <h3>Patrocinadores</h3>
          <div className="sponsors-grid">
            <div className="sponsor-item">
              <img src="#" alt="Sponsor 1" className="sponsor-logo" />
              <span>Empresa 1</span>
            </div>
            <div className="sponsor-item">
              <img src="#" alt="Sponsor 2" className="sponsor-logo" />
              <span>Empresa 2</span>
            </div>
            <div className="sponsor-item">
              <img src="#" alt="Sponsor 3" className="sponsor-logo" />
              <span>Empresa 3</span>
            </div>
            <div className="sponsor-item">
              <img src="#" alt="Sponsor 4" className="sponsor-logo" />
              <span>Empresa 4</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 Git Adventure. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}