// import './Footer.css'; // Remover importação de CSS

export default function Footer() {
  return (
    // Aplicar classes Tailwind diretamente
    // <footer className="footer">
    <footer className="w-full bg-gray-800 text-white py-5 px-0">
      {/* <div className="footer-container"> */}
      <div className="flex flex-wrap justify-between max-w-screen-xl mx-auto px-4">
        {/* <div className="footer-section about"> */}
        <div className="flex-1 min-w-[180px] mb-4 px-2.5">
          {/* <h3>Git Adventure</h3> */}
          <h3 className="text-base font-semibold mb-2.5 text-orange-500">Git Adventure</h3>
          {/* <p>Plataforma interativa para aprendizado de Git.</p> */}
          <p className="text-gray-400 text-xs leading-snug">Plataforma interativa para aprendizado de Git.</p>
        </div>
        
        {/* <div className="footer-section links"> */}
        <div className="flex-1 min-w-[180px] mb-4 px-2.5">
          {/* <h3>Links</h3> */}
          <h3 className="text-base font-semibold mb-2.5 text-orange-500">Links</h3>
          {/* <ul className="links ul"> */}
          <ul className="list-none p-0">
            {/* <li className="links ul li"> */}
            <li className="mb-1.5">
              {/* <a href="#" className="links ul li a">Início</a> */}
              <a href="#" className="text-gray-400 no-underline transition-colors duration-300 ease-in-out hover:text-orange-500 text-xs">Início</a>
            </li>
            <li className="mb-1.5">
              <a href="#" className="text-gray-400 no-underline transition-colors duration-300 ease-in-out hover:text-orange-500 text-xs">Sobre</a>
            </li>
            <li className="mb-1.5">
              <a href="#" className="text-gray-400 no-underline transition-colors duration-300 ease-in-out hover:text-orange-500 text-xs">Tutorial</a>
            </li>
          </ul>
        </div>
        
        {/* Seção de Sponsors (mantida a estrutura, mas sem estilos CSS específicos) */}
        {/* Você precisaria adicionar classes Tailwind se essa seção for usada */}
        {/* 
        <div className="flex-1 min-w-[180px] mb-4 px-2.5">
          <h3 className="text-base font-semibold mb-2.5 text-orange-500">Sponsors</h3>
          <div className="grid grid-cols-2 gap-2.5"> 
            <div className="flex flex-col items-center text-center"> 
              <div className="w-10 h-10 bg-white bg-opacity-10 rounded mb-1"></div> 
              <span className="text-xs text-gray-400">Sponsor 1</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-white bg-opacity-10 rounded mb-1"></div>
              <span className="text-xs text-gray-400">Sponsor 2</span>
            </div>
          </div>
        </div>
        */}
      </div>
      
      {/* <div className="footer-bottom"> */}
      <div className="text-center mt-2.5 pt-2.5 border-t border-gray-600 w-full">
        {/* <p>&copy; 2025 Git Adventure</p> */}
        <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Git Adventure</p>
      </div>
    </footer>
  );
}