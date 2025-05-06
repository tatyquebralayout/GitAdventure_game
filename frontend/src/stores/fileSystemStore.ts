import { create } from 'zustand';

interface FileSystemState {
  files: Record<string, string>;
  currentDirectory: string;
  setFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
  deleteDirectory: (path: string) => void;
  setCurrentDirectory: (path: string) => void;
  getFileContent: (path: string) => string | undefined;
  clear: () => void;
}

export const useFileSystem = create<FileSystemState>((set, get) => ({
  files: {},
  currentDirectory: '/',
  
  setFile: (path: string, content: string) => {
    set((state) => ({
      files: {
        ...state.files,
        [path]: content
      }
    }));
  },
  
  deleteFile: (path: string) => {
    set((state) => {
      const newFiles = { ...state.files };
      delete newFiles[path];
      return { files: newFiles };
    });
  },
  
  deleteDirectory: (path: string) => {
    set((state) => {
      const newFiles = { ...state.files };
      Object.keys(newFiles).forEach((filePath) => {
        if (filePath.startsWith(path)) {
          delete newFiles[filePath];
        }
      });
      return { files: newFiles };
    });
  },
  
  setCurrentDirectory: (path: string) => {
    set({ currentDirectory: path });
  },
  
  getFileContent: (path: string) => {
    return get().files[path];
  },
  
  clear: () => {
    set({ files: {}, currentDirectory: '/' });
  },
}));