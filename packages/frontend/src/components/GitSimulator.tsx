import React from 'react';

interface GitSimulatorProps {
  children?: React.ReactNode;
}

const GitSimulator: React.FC<GitSimulatorProps> = ({ children }) => {
  return (
    <div className="git-simulator">
      {children || 'GitSimulator'}
    </div>
  );
};

export default GitSimulator; 