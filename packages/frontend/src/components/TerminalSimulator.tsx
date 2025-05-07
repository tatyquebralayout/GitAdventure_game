import React from 'react';

interface TerminalSimulatorProps {
  children?: React.ReactNode;
}

const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({ children }) => {
  return (
    <div className="terminal-simulator">
      {children || 'TerminalSimulator'}
    </div>
  );
};

export default TerminalSimulator; 