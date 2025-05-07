import React from 'react';

interface GitGraphProps {
  children?: React.ReactNode;
}

const GitGraph: React.FC<GitGraphProps> = ({ children }) => {
  return (
    <div className="git-graph">
      {children || 'GitGraph'}
    </div>
  );
};

export default GitGraph; 