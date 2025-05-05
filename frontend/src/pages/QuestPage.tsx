import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Quest, QuestNarrative, QuestCommandStep, questApi } from '../api/questApi';

// Definindo a interface para os parâmetros da rota
interface QuestParams {
  questId: string;
}

const QuestPage = () => {
  // Usando o useParams corretamente para React Router v7
  const params = useParams<QuestParams>();
  const questId = params.questId;
  const navigate = useNavigate();
  
  const [quest, setQuest] = useState<Quest | null>(null);
  const [narratives, setNarratives] = useState<QuestNarrative[]>([]);
  const [steps, setSteps] = useState<QuestCommandStep[]>([]);
  const [activeNarrative, setActiveNarrative] = useState<QuestNarrative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestData = async () => {
      if (!questId) return;
      
      try {
        setLoading(true);
        
        // Carregar informações da quest
        const questResponse = await questApi.getQuestById(questId);
        if (!questResponse.success || !questResponse.quest) {
          setError(questResponse.message || 'Falha ao carregar informações da quest');
          return;
        }
        
        setQuest(questResponse.quest);
        
        // Carregar narrativas da quest
        const narrativesResponse = await questApi.getQuestNarratives(questId);
        if (narrativesResponse.success && narrativesResponse.narratives) {
          setNarratives(narrativesResponse.narratives);
          
          // Definir a narrativa inicial (começando)
          const startingNarrative = narrativesResponse.narratives.find(
            narrative => narrative.status === 'starting'
          );
          
          if (startingNarrative) {
            setActiveNarrative(startingNarrative);
          }
        }
        
        // Carregar passos de comando da quest
        const stepsResponse = await questApi.getQuestCommandSteps(questId);
        if (stepsResponse.success && stepsResponse.steps) {
          setSteps(stepsResponse.steps);
        }
        
      } catch (err) {
        setError('Erro ao conectar com o servidor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestData();
  }, [questId]);

  const handleStartQuest = async (worldId: string) => {
    if (!questId) return;
    
    try {
      setLoading(true);
      const response = await questApi.startQuest(questId, worldId);
      
      if (response.success) {
        // Redirecionar para o simulador
        navigate(`/simulator/${worldId}/${questId}`);
      } else {
        setError(response.message || 'Falha ao iniciar a quest');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!quest) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-xl">Quest não encontrada</div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate(-1)}
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <button 
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
          onClick={() => navigate(-1)}
        >
          <span className="material-icons mr-1">arrow_back</span>
          Voltar
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-3xl font-bold">{quest.name}</h1>
          <p className="mt-2 text-blue-100">{quest.description}</p>
        </div>
        
        <div className="p-6">
          {/* Narrativa atual */}
          {activeNarrative && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">Contexto da Missão</h3>
              <p className="text-gray-700 whitespace-pre-line">{activeNarrative.context}</p>
            </div>
          )}
          
          {/* Lista de passos */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Passos da Quest</h3>
            
            {steps.length === 0 ? (
              <p className="text-gray-500">Esta quest não possui passos definidos.</p>
            ) : (
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className="p-3 border rounded-lg flex items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center mr-3 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{step.commandName}</h4>
                      <p className="text-gray-600 mt-1">{step.description}</p>
                      {step.hint && (
                        <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200">
                          <strong>Dica:</strong> {step.hint}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Botão para iniciar */}
          <div className="flex justify-center">
            <button
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold text-lg transition-colors"
              onClick={() => handleStartQuest('default-world-id')}
            >
              Iniciar Quest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestPage; 