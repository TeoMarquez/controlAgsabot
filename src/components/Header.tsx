// src/components/Header.tsx

interface HeaderProps {
  onTutorialClick?: () => void;
}

export default function Header({ onTutorialClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-center relative h-14 bg-white shadow px-4">
      <button
        onClick={onTutorialClick}
        className="absolute left-4 text-blue-600 hover:text-blue-800 focus:outline-none"
        aria-label="Abrir tutorial"
      >
        Tutorial
      </button>
      <h1 className="text-lg font-semibold">AGSA-BOT Control</h1>
    </header>
  );
}
