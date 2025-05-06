import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayerWorld } from '../api/worldApi';
import { authApi } from '../api/authApi';

interface PlayerWorldSafe extends Omit<PlayerWorld, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt: Date;
}

const PlayerProgressPage = () => {
  const [playerWorlds, setPlayerWorlds] = useState<PlayerWorldSafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = authApi.isAuthenticated();
      setIsAuthenticated(isLoggedIn);

      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Example mock data with proper type safety
        const mockPlayerWorlds: PlayerWorldSafe[] = [
          {
            id: '1',
            userId: 'user-1',
            worldId: 'world-1',
            status: 'started',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            userId: 'user-1',
            worldId: 'world-2',
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        
        setPlayerWorlds(mockPlayerWorlds);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao carregar seu progresso';
        setError(message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Seu Progresso</h1>
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-6 max-w-lg mx-auto">
          <p className="text-lg mb-4">Você precisa estar logado para ver seu progresso.</p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Fazer Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Seu Progresso</h1>
      
      {playerWorlds.length === 0 ? (
        <div className="text-center bg-gray-50 p-8 rounded-lg max-w-2xl mx-auto">
          <p className="text-xl mb-4">Você ainda não iniciou nenhum mundo.</p>
          <Link 
            to="/worlds" 
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Explorar Mundos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {playerWorlds.map((playerWorld) => (
            <div 
              key={playerWorld.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Mundo #{playerWorld.worldId}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    playerWorld.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {playerWorld.status === 'completed' ? 'Completado' : 'Em progresso'}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  Iniciado em: {new Date(playerWorld.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quests</h3>
                
                {/* Aqui precisaríamos buscar as quests do jogador neste mundo */}
                <div className="text-gray-500 text-center py-4">
                  Informações sobre quests serão carregadas em breve...
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Link 
                    to={`/worlds/${playerWorld.worldId}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Continuar Jogando
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerProgressPage;