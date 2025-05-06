import './ProgressCard.css';
import DevTip from '../../ui/DevHelper/DevTip';

// Define a type for the progress item data
interface ProgressItem {
  id: number;
  icon: string; // URL or identifier for the icon
  title: string;
  current: number;
  target: number | string; // Target can be a number or text like '1 mil'
}

export default function ProgressCard() {
  // Example of progress data with the new structure
  // TODO: Replace with actual data fetched from progressApi.getProgress()
  const progressItems: ProgressItem[] = [
    { id: 1, icon: '/path/to/icon1.png', title: 'Iniciou o tutorial básico', current: 1, target: 1 },
    { id: 2, icon: '/path/to/icon2.png', title: 'Aprendeu o comando git init', current: 1, target: 1 },
    { id: 3, icon: '/path/to/icon3.png', title: 'Criou seu primeiro commit', current: 5, target: 10 },
    { id: 4, icon: '/path/to/icon4.png', title: 'Explorou o mundo de Git Basics', current: 3, target: 5 },
    { id: 5, icon: '/path/to/icon5.png', title: 'Completou missão de ramificação', current: 1, target: 1 },
    { id: 6, icon: '/path/to/icon6.png', title: 'Aprendeu sobre merges', current: 2, target: 3 },
    { id: 7, icon: '/path/to/icon7.png', title: 'Resolveu conflito de merge', current: 0, target: 1 },
    // Add more items as needed
  ];

  return (
    <DevTip
      componentName="ProgressCard"
      description="Exibe o progresso gamificado do jogador, mostrando conquistas com ícones, títulos e progresso atual/total."
      integrationTip="Deve usar progressApi.getProgress() para buscar o progresso real do jogador do backend, incluindo dados para ícones, títulos e valores de progresso."
    >
      <div className="progress-card card">
        <h3>Progressão</h3>
        <div className="progress-messages">
          {progressItems.map((item) => (
            <div key={item.id} className="progress-message">
              <img src={item.icon} alt="" className="progress-icon" />
              <div className="progress-details">
                <span className="progress-title">{item.title}</span>
                {/* Optional: Add description if needed */}
              </div>
              <span className="progress-count">{`${item.current} / ${item.target}`}</span>
            </div>
          ))}
        </div>
      </div>
    </DevTip>
  );
}