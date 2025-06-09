export const Footer = () => {
    const BACKOFFICE_URL = process.env.BACKOFFICE_URL;
  
    return (
      <footer className="bg-white py-4 px-6 mt-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
        <nav className="flex justify-center space-x-6">
          <a
            href={BACKOFFICE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-500 transition-colors duration-200"
          >
            Administraton zone
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-500 transition-colors duration-200"
          >
            Contact
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-500 transition-colors duration-200"
          >
            Help
          </a>
        </nav>
      </footer>
    );
  };
  