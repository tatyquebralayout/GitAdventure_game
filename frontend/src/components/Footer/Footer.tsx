import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section about">
          <h3>Git Adventure</h3>
          <p>Plataforma interativa para aprendizado de Git.</p>
        </div>
        
        <div className="footer-section links">
          <h3>Links</h3>
          <ul>
            <li><a href="#">Início</a></li>
            <li><a href="#">Sobre</a></li>
            <li><a href="#">Tutorial</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2025 Git Adventure</p>
      </div>
    </footer>
  );
}