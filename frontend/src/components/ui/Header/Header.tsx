import { Link, useLocation, Location } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Header.css';
import { authApi } from '../../../api/authApi';

export default function Header() {
  const location: Location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showHero, setShowHero] = useState(true);

  // Check authentication
  useEffect(() => {
    setIsAuthenticated(authApi.isAuthenticated());
  }, []);

  // Only show hero section on home and worlds pages
  useEffect(() => {
    const path = location.pathname;
    setShowHero(path === '/' || path === '/worlds');
  }, [location]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setIsAuthenticated(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear authentication state on error
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };

  return (
    <>
      <header className="header bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">GitAdventure</Link>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <Link 
              to="/worlds" 
              className={`hover:text-blue-300 ${location.pathname === '/worlds' ? 'text-blue-400' : ''}`}
            >
              Mundos
            </Link>
            
            <Link 
              to="/game" 
              className={`hover:text-blue-300 ${location.pathname === '/game' ? 'text-blue-400' : ''}`}
            >
              Simulador
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/progress" 
                className={`hover:text-blue-300 ${location.pathname === '/progress' ? 'text-blue-400' : ''}`}
              >
                Meu Progresso
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm hidden md:inline-block">Olá, Aventureiro!</span>
                <button 
                  onClick={() => {
                    void handleLogout();
                  }}
                  className="px-3 py-1 rounded border border-red-400 text-red-400 hover:bg-red-400 hover:text-white text-sm transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-1 rounded border border-white text-white hover:bg-white hover:text-gray-800 transition-colors hidden md:inline-block"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {showHero && (
        <section className="hero-section bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Git Adventure</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Aprenda Git de forma interativa e divertida em uma jornada através de mundos e desafios!
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/worlds" 
                className="px-6 py-3 bg-green-500 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                Começar Aventura
              </Link>
              <Link 
                to="/game" 
                className="px-6 py-3 bg-yellow-500 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
              >
                Ir para Simulador
              </Link>
              <a 
                href="https://git-scm.com/docs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white bg-opacity-20 rounded-lg font-semibold hover:bg-opacity-30 transition-colors"
              >
                Documentação Git
              </a>
            </div>
          </div>
        </section>
      )}
    </>
  );
}