'use client';

import { useState, useEffect, useRef } from 'react';

interface Location {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface LocationSelectorProps {
  defaultLocation: string;
  onLocationChange: (location: string) => void;
}

export default function LocationSelector({ defaultLocation, onLocationChange }: LocationSelectorProps) {
  const [query, setQuery] = useState(defaultLocation);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const debounce = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/location?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.locations);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Location search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (location: Location) => {
    const displayName = location.state 
      ? `${location.name}, ${location.state}, ${location.country}`
      : `${location.name}, ${location.country}`;
    setQuery(displayName);
    setSuggestions([]);
    setIsOpen(false);
    onLocationChange(location.name);
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="w-full px-6 py-4 glass rounded-2xl text-white placeholder-white/60 
                     focus:outline-none focus:ring-2 focus:ring-white/50 transition-all
                     text-lg font-medium"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full glass rounded-2xl overflow-hidden z-50">
          {suggestions.map((location, index) => (
            <button
              key={index}
              onClick={() => handleSelect(location)}
              className="w-full px-6 py-3 text-left text-white hover:bg-white/10 
                         transition-colors border-b border-white/10 last:border-b-0"
            >
              <div className="font-medium">
                {location.name}
                {location.state && `, ${location.state}`}
              </div>
              <div className="text-sm text-white/70">{location.country}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
