import { useState, useCallback } from 'react';

// Interface para o estado gerenciado pelo hook
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

// Interface para as funções retornadas pelo hook
interface AsyncStateActions<T> {
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  execute: <P extends unknown[]>(asyncFn: (...args: P) => Promise<T>) => (...args: P) => Promise<void>;
}

// Hook customizado para gerenciar estado assíncrono
function useAsyncState<T>(
  initialData: T | null = null
): AsyncState<T> & AsyncStateActions<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Função wrapper para executar operações assíncronas
  const execute = useCallback(
    <P extends unknown[]>(asyncFn: (...args: P) => Promise<T>) =>
      async (...args: P): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
          const result = await asyncFn(...args);
          setData(result);
        } catch (err) {
          setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setLoading(false);
        }
      },
    [] // useCallback dependency array is empty as it doesn't depend on component state/props
  );

  return {
    data,
    loading,
    error,
    setData,
    setLoading,
    setError,
    execute,
  };
}

export default useAsyncState; 