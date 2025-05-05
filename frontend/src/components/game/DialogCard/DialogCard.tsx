import { useMemo } from 'react';
import './DialogCard.css';
import { useGame } from '../../../hooks/useGame';
import DevTip from '../../ui/DevHelper/DevTip';

export default function DialogCard() {
  // Usando useMemo para armazenar em cache o retorno do hook
  const gameState = useGame();
  const { location, hasVisited } = gameState;
  
  // Usando useMemo para evitar recálculos desnecessários e ciclos infinitos
  const dialogText = useMemo(() => {
    if (location === 'start') {
      return "Welcome to Git Adventure! Your journey begins here.";
    } else if (location === 'mission-1') {
      return hasVisited('mission-1') 
        ? "Welcome back to Mission 1. Let's continue your journey."
        : "This is Mission 1. You'll learn the basics of Git here.";
    }
    return "Continue exploring the Git world!";
  }, [location, hasVisited]);
  
  return (
    <DevTip
      componentName="DialogCard"
      description="Exibe diálogos e narrativas relacionados à missão atual do jogador."
      integrationTip="Deve usar questApi.getQuestNarratives() para mostrar textos dinâmicos baseados na missão atual."
    >
      <div className="dialog-card card">
        <div className="dialog-container">
          <div className="git-svg">
            <div className="svg-placeholder">svg git hub</div>
          </div>
          <div className="dialog-content">
            <div className="dialog-text">
              <p>{dialogText}</p>
            </div>
          </div>
        </div>
      </div>
    </DevTip>
  );
}