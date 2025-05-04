import './Header.css';

export default function Header() {
  return (
    <>
      <header className="header">
        <div className="header-content">
          <h2>Hearder para menu com admin, login, e outros</h2>
        </div>
      </header>
      <section className="hero-section">
        <div className="hero-container">
          <h1>Git Adventure</h1>
          <p>Aprenda Git de forma interativa e divertida!</p>
          <div className="hero-buttons">
            <button className="primary-button">Começar Aventura</button>
            <button className="secondary-button">Saiba Mais</button>
          </div>
        </div>
      </section>
    </>
  );
}