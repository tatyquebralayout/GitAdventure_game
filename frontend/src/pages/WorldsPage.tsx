import { useEffect } from 'react';
import { World } from '@shared/types/worlds';
import { worldApi } from '../api/worldApi';
import { Link } from 'react-router-dom';
import useAsyncState from '../hooks/useAsyncState';
import { ApiResponse } from '@shared/types/api';

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
        throw new Error(response.message || 'Failed to load worlds');
      }
      return response.data;
    };

    const loadData = async () => {
      try {
        await fetchWorlds(loadWorlds)();
      } catch (error) {
        console.error('Failed to load worlds:', error);
      }
    };

    void loadData();
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
        <div className="text-red-500 text-xl mb-4">{apiError.message}</div>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={async () => {
            try {
              await fetchWorlds(loadWorlds)();
            } catch (error) {
              console.error('Retry failed:', error);
            }
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Worlds</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {worlds?.map((world) => (
          <div 
            key={world.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{world.name}</h2>
              <p className="text-gray-600 mb-4">{world.description}</p>
              <div className="mb-4">
                <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {world.difficulty}
                </span>
              </div>
              <Link 
                to={`/worlds/${world.slug}`} 
                className="block w-full text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-300"
              >
                Explore World
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldsPage;