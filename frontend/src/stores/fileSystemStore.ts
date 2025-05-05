import { create } from 'zustand';

// Definição da interface para arquivos/diretórios virtuais
interface VirtualFile {
  type: 'file' | 'dir';
  content?: string;
}

// Interface para o estado do sistema de arquivos
interface FileSystemState {
  currentDir: string;
  files: Record<string, VirtualFile>;
}

// Interface para as ações do store
interface FileSystemActions {
  changeDirectory: (newDir: string) => void;
  createDirectory: (path: string) => void;
  createFile: (path: string, content?: string) => void;
  deletePath: (path: string, recursive: boolean) => void;
  resetFileSystem: () => void;
}

// Estado inicial (copiado/adaptado de shellCommands.ts)
const initialFS: FileSystemState = {
  currentDir: '/home/player',
  files: {
    '/': { type: 'dir' },
    '/home': { type: 'dir' },
    '/home/player': { type: 'dir' },
    '/home/player/README.md': { 
      type: 'file', 
      content: '# Bem-vindo ao Git Adventure\n\nEste é um jogo educativo para aprender comandos Git.' 
    },
    '/home/player/src': { type: 'dir' },
    '/home/player/src/index.js': { 
      type: 'file', 
      content: 'console.log("Hello Git Adventure!");' 
    }
  }
};

// Criar o store Zustand
export const useFileSystemStore = create<FileSystemState & FileSystemActions>()((set) => ({
  ...initialFS,

  // Ações para modificar o estado
  changeDirectory: (newDir) => set({ currentDir: newDir }),

  createDirectory: (path) => set((state) => ({
    files: { ...state.files, [path]: { type: 'dir' } }
  })),

  createFile: (path, content = '') => set((state) => ({
    files: { ...state.files, [path]: { type: 'file', content } }
  })),

  deletePath: (path, recursive) => set((state) => {
    const newFiles = { ...state.files };
    if (newFiles[path]) {
      // Se for diretório e recursivo, remover conteúdos
      if (newFiles[path].type === 'dir' && recursive) {
        Object.keys(newFiles).forEach(p => {
          if (p.startsWith(`${path}/`)) {
            delete newFiles[p];
          }
        });
      }
      // Remover o próprio path
      delete newFiles[path];
    }
    return { files: newFiles };
  }),

  resetFileSystem: () => set({ ...initialFS }),
})); 