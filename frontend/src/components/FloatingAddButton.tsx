import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
  onClick: () => void;
  label?: string;
}

export default function FloatingAddButton({ onClick, label = 'Add Item' }: FloatingAddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground rounded-full shadow-marketplace hover:shadow-marketplace-hover hover:scale-105 transition-all duration-200 font-semibold text-sm border-2 border-primary/20"
      aria-label={label}
    >
      <Plus className="h-5 w-5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
