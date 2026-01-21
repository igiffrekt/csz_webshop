'use client';

import { useState, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsSearching(true);
      router.push(`/termekek?search=${encodeURIComponent(query.trim())}`);
      // Small delay to show loading state
      setTimeout(() => {
        setIsSearching(false);
        setQuery('');
        inputRef.current?.blur();
      }, 300);
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative flex-1 max-w-xl', className)}>
      <div
        className={cn(
          'flex items-center bg-secondary-100 rounded-full overflow-hidden transition-all',
          isFocused && 'ring-2 ring-primary-500 bg-white'
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Keresés termékek között..."
          className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm placeholder:text-secondary-500"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 hover:text-primary-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className={cn(
            'bg-primary-500 text-white p-2.5 hover:bg-primary-600 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
}
