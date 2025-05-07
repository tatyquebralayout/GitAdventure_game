import React from 'react';

interface DialogCardProps {
  children?: React.ReactNode;
}

const DialogCard: React.FC<DialogCardProps> = ({ children }) => {
  return (
    <div className="dialog-card">
      {children || 'DialogCard'}
    </div>
  );
};

export default DialogCard; 