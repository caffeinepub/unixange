import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingAddButtonProps {
  onClick: () => void;
}

export default function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-8 right-8 h-16 w-16 rounded-full border-2 border-primary bg-primary shadow-marketplace-lg transition-marketplace hover:scale-110 hover:shadow-marketplace-hover"
    >
      <Plus className="h-6 w-6 text-primary-foreground" />
    </Button>
  );
}
