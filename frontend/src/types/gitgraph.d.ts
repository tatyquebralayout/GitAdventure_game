/*
  // Declaração de tipos para o @gitgraph/react v1.6.0
  // Esta versão simplificada apenas define os exports confirmados da biblioteca

  declare module '@gitgraph/react' {
    import * as React from 'react';
    
    // Type definitions for Gitgraph options
    export interface GitgraphOptions {
      template?: GitgraphTemplate;
      [key: string]: unknown;
    }
    
    export interface GitgraphTemplate {
      colors?: string[];
      branch?: {
        lineWidth?: number;
        spacing?: number;
        label?: {
          font?: string;
          bgColor?: string;
        };
      };
      commit?: {
        spacing?: number;
        dot?: {
          size?: number;
        };
        message?: {
          font?: string;
          display?: boolean;
        };
      };
      [key: string]: unknown;
    }
    
    // Gitgraph API type
    export interface GitgraphApi {
      branch: (name: string) => GitgraphBranchApi;
      clear: () => void;
      commit: (options?: CommitOptions) => GitgraphApi;
      [key: string]: unknown;
    }
    
    export interface GitgraphBranchApi {
      branch: (name: string) => GitgraphBranchApi;
      commit: (options?: CommitOptions) => GitgraphBranchApi;
      merge: (options: MergeOptions) => GitgraphBranchApi;
      checkout: () => GitgraphBranchApi;
      [key: string]: unknown;
    }
    
    export interface CommitOptions {
      subject?: string;
      hash?: string;
      [key: string]: unknown;
    }
    
    export interface MergeOptions {
      branch: GitgraphBranchApi;
      subject?: string;
      commitOptions?: CommitOptions;
      [key: string]: unknown;
    }
    
    // Componente principal exportado pela biblioteca
    export const GitgraphReact: React.ComponentType<{
      options?: GitgraphOptions;
      children?: (gitgraph: GitgraphApi) => React.ReactNode;
    }>;
    
    // Funções utilitárias exportadas
    export function templateExtend(templateName: TemplateName, options: Partial<GitgraphTemplate>): GitgraphTemplate;
    
    // Enums exportados
    export enum TemplateName {
      Metro = "metro",
      Default = "default"
    }
  }
*/