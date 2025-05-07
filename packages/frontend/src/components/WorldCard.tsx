import React from 'react';

interface WorldCardProps {
  children?: React.ReactNode;
}

const WorldCard: React.FC<WorldCardProps> = ({ children }) => {
  return (
    <div className="world-card">
      {children || 'WorldCard'}
    </div>
  );
};

export default WorldCard; 