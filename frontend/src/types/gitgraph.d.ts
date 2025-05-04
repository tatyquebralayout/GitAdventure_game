// Declaração de tipos para o @gitgraph/react v1.6.0
// Esta versão simplificada apenas define os exports confirmados da biblioteca

declare module '@gitgraph/react' {
  import * as React from 'react';
  
  // Componente principal exportado pela biblioteca
  export const GitgraphReact: React.ComponentType<{
    options?: any;
    children?: (gitgraph: any) => React.ReactNode;
  }>;
  
  // Funções utilitárias exportadas
  export function templateExtend(templateName: any, options: any): any;
  
  // Enums exportados
  export enum TemplateName {
    Metro = "metro",
    Default = "default"
  }
}