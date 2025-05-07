import React from 'react';

interface ProgressCardProps {
  children?: React.ReactNode;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ children }) => {
  return (
    <div className="progress-card">
      {children || 'ProgressCard'}
    </div>
  );
};

export default ProgressCard; 