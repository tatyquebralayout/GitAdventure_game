import { useEffect, useState } from 'react';
import { World, worldApi } from '../api/worldApi';
import { Link } from 'react-router-dom';

const WorldsPage = () => {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorlds = async () => {
      try {
        setLoading(true);
        const response = await worldApi.getAllWorlds();
        
        if (response.success && response.worlds) {
          setWorlds(response.worlds);
        } else {
          setError(response.message || 'Falha ao carregar mundos');
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorlds();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
      <h1 className="text-3xl font-bold mb-8 text-center">Mundos do Git</h1>
      
      {worlds.length === 0 ? (
        <div className="text-center text-gray-500">
          Nenhum mundo disponível no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {worlds.map((world) => (
            <div 
              key={world.id}
              className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`p-4 ${getDifficultyColor(world.difficulty)}`}>
                <h3 className="text-xl font-semibold text-white">{world.name}</h3>
                <span className="inline-block px-2 py-1 rounded bg-white bg-opacity-20 text-white text-sm">
                  {getDifficultyLabel(world.difficulty)}
                </span>
              </div>
              
              <div className="p-4">
                <p className="text-gray-700 mb-4">{world.description}</p>
                <Link 
                  to={`/worlds/${world.id}`}
                  className="block w-full text-center py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Explorar mundo
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Funções auxiliares para estilização
const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-500';
    case 'intermediate':
      return 'bg-yellow-500';
    case 'advanced':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
  }
};

const getDifficultyLabel = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner':
      return 'Iniciante';
    case 'intermediate':
      return 'Intermediário';
    case 'advanced':
      return 'Avançado';
    default:
      return 'Desconhecido';
  }
};

export default WorldsPage; 