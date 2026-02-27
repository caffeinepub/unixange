import { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';

interface AISmartSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AISmartSearch({ onSearch, placeholder = 'Search with AI... e.g. "laptop under ₹5000"', className = '' }: AISmartSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
      onSearch(query);
      setIsSearching(false);
    }, 300);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="absolute left-3 flex items-center gap-1 text-primary">
        <Sparkles className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-20 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
      />
      <div className="absolute right-2 flex items-center gap-1">
        {query && (
          <button type="button" onClick={handleClear} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1"
        >
          {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Search
        </button>
      </div>
    </form>
  );
}
