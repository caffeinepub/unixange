import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-30 h-16 w-16 rounded-full bg-primary text-primary-foreground border-2 border-primary-foreground/20 marketplace-shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      aria-label="Add new listing"
    >
      <Plus className="h-7 w-7" />
    </button>
  );
}
