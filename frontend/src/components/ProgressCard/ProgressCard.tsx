import './ProgressCard.css';

export default function ProgressCard() {
  // Exemplo de mensagens de progresso (você pode substituir por dados reais)
  const progressMessages = [
    'Iniciou o tutorial básico',
    'Aprendeu o comando git init',
    'Criou seu primeiro commit',
    'Explorou o mundo de Git Basics',
    'Completou missão de ramificação',
    'Aprendeu sobre merges',
    'Resolveu conflito de merge'
  ];

  return (
    <div className="progress-card card">
      <h3>Progressão</h3>
      <div className="progress-messages">
        {progressMessages.map((message, index) => (
          <div key={index} className="progress-message">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
}