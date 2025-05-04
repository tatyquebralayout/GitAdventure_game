import './DialogCard.css';
import { useGame } from '../../hooks/useGame';

export default function DialogCard() {
  const { location, hasVisited } = useGame();
  
  // Example of dynamic dialog text based on current location and visit history
  const getDialogText = () => {
    if (location === 'start') {
      return "Welcome to Git Adventure! Your journey begins here.";
    } else if (location === 'mission-1') {
      return hasVisited('mission-1') 
        ? "Welcome back to Mission 1. Let's continue your journey."
        : "This is Mission 1. You'll learn the basics of Git here.";
    }
    return "Continue exploring the Git world!";
  };
  
  return (
    <div className="dialog-card card">
      <div className="dialog-container">
        <div className="git-svg">
          <div className="svg-placeholder">svg git hub</div>
        </div>
        <div className="dialog-content">
          <div className="dialog-text">
            <p>{getDialogText()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}