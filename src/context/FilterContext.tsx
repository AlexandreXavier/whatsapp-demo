import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { FilterState } from '../types';

interface FilterContextType {
  selectedUsers: string[];
  toggleUser: (userName: string) => void;
  clearFilters: () => void;
  isUserSelected: (userName: string) => boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY = 'whatsapp-analytics-filters';

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as FilterState;
        return parsed.selectedUsers || [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ selectedUsers }));
  }, [selectedUsers]);

  const toggleUser = useCallback((userName: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userName)) {
        return prev.filter(u => u !== userName);
      }
      return [...prev, userName];
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedUsers(prev => (prev.length === 0 ? prev : []));
  }, []);

  const isUserSelected = useCallback((userName: string) => {
    return selectedUsers.length === 0 || selectedUsers.includes(userName);
  }, [selectedUsers]);

  const value = useMemo(
    () => ({ selectedUsers, toggleUser, clearFilters, isUserSelected }),
    [selectedUsers, toggleUser, clearFilters, isUserSelected],
  );

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
