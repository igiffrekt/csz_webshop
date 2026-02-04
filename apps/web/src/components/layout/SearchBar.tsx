'use client';

import { useState, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  variant?: 'default' | 'hero';
}

export function SearchBar({ className, variant = 'default' }: SearchBarProps) {
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

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
        <div
          className={cn(
            'flex items-center justify-between h-[45px] px-[30px] py-[10px] border-2 border-[#030712] rounded-[100px] bg-transparent transition-all',
            isFocused && 'border-black shadow-sm'
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Termékkereső"
            className="flex-1 bg-transparent outline-none text-[16px] text-black placeholder:text-black leading-[1.15]"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-gray-600 transition-colors mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={isSearching}
            className="flex items-center justify-center"
          >
            {isSearching ? (
              <Loader2 className="h-6 w-6 animate-spin text-black" />
            ) : (
              <Search className="h-6 w-6 text-black" />
            )}
          </button>
        </div>
      </form>
    );
  }

  // Default variant for mobile
  return (
    <form onSubmit={handleSubmit} className={cn('relative flex-1', className)}>
      <div
        className={cn(
          'flex items-center justify-between h-[45px] px-[20px] border-2 border-[#030712] rounded-[100px] bg-transparent transition-all',
          isFocused && 'border-black shadow-sm'
        )}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Termékkereső"
          className="flex-1 bg-transparent outline-none text-[14px] text-black placeholder:text-black leading-[1.15]"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:text-gray-600 transition-colors mr-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={isSearching}
          className="flex items-center justify-center"
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin text-black" />
          ) : (
            <Search className="h-5 w-5 text-black" />
          )}
        </button>
      </div>
    </form>
  );
}
