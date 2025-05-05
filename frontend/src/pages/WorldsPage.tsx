import { useEffect } from 'react';
import { World } from '@shared/types/worlds'; // Updated import path
import { worldApi } from '../api/worldApi';
import { Link } from 'react-router-dom';
import useAsyncState from '../hooks/useAsyncState';
import { ApiResponse } from '@shared/types/api'; // Updated import path

const WorldsPage = () => {
  const { 
    data: worlds,
    loading, 
    error: apiError,
    execute: fetchWorlds
  } = useAsyncState<World[]>();

  useEffect(() => {
    const loadWorlds = async (): Promise<World[]> => {
      const response: ApiResponse<World[]> = await worldApi.getAllWorlds();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Falha ao carregar mundos');
      }
      return response.data;
    };

    fetchWorlds(loadWorlds)();
  }, [fetchWorlds]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{apiError.message}</div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => fetchWorlds(async () => {
            const response = await worldApi.getAllWorlds();
            if (!response.success || !response.data) {
              throw new Error(response.message || 'Falha ao carregar mundos');
            }
            return response.data;
          })()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Escolha seu Mundo</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(worlds || []).map((world) => (
          <div key={world.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{world.name}</h2>
              <p className="text-gray-600 mb-4">{world.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${world.difficulty === 'beginner' ? 'bg-green-100 text-green-800' : world.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {world.difficulty}
                </span>
              </div>
              <Link 
                to={`/worlds/${world.slug}`} 
                className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-300"
              >
                Explorar Mundo
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldsPage;