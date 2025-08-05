// src/components/Header.tsx

interface HeaderProps {
  onTutorialClick?: () => void;
}

export default function Header({ onTutorialClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-center relative h-14 bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg px-4 text-white">
      <button
        onClick={onTutorialClick}
        className="absolute left-4 text-white hover:text-gray-200 focus:outline-none"
        aria-label="Abrir tutorial"
      >
        Tutorial
      </button>
      <h1 className="text-lg font-semibold">AGSA-BOT Control</h1>
    </header>
  );
}
