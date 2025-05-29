import { useState, useEffect } from 'react';

interface JournalEntry {
  id: string;
  date: string;
  audioUrl: string | null;
  transcript: string;
  reflection: string | null;
  mood?: string;
}

interface UseLocalStorageReturn {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => string;
  getEntry: (id: string) => JournalEntry | undefined;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => boolean;
  deleteEntry: (id: string) => boolean;
  searchEntries: (query: string) => JournalEntry[];
}

export const useLocalStorage = (): UseLocalStorageReturn => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Load entries from localStorage on initial mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('journalEntries');
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      }
    } catch (error) {
      console.error('Error loading entries from localStorage:', error);
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('journalEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving entries to localStorage:', error);
    }
  }, [entries]);

  // Add a new entry
  const addEntry = (entry: Omit<JournalEntry, 'id' | 'date'>): string => {
    const id = Date.now().toString();
    const newEntry: JournalEntry = {
      ...entry,
      id,
      date: new Date().toISOString(),
    };

    setEntries(prevEntries => [...prevEntries, newEntry]);
    return id;
  };

  // Get a specific entry by ID
  const getEntry = (id: string): JournalEntry | undefined => {
    return entries.find(entry => entry.id === id);
  };

  // Update an existing entry
  const updateEntry = (id: string, updates: Partial<JournalEntry>): boolean => {
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      return false;
    }

    const updatedEntries = [...entries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      ...updates
    };

    setEntries(updatedEntries);
    return true;
  };

  // Delete an entry
  const deleteEntry = (id: string): boolean => {
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      return false;
    }

    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    return true;
  };

  // Search entries by transcript content
  const searchEntries = (query: string): JournalEntry[] => {
    if (!query.trim()) {
      return entries;
    }

    const lowerCaseQuery = query.toLowerCase();
    return entries.filter(entry => 
      entry.transcript.toLowerCase().includes(lowerCaseQuery) ||
      (entry.reflection && entry.reflection.toLowerCase().includes(lowerCaseQuery))
    );
  };

  return {
    entries,
    addEntry,
    getEntry,
    updateEntry,
    deleteEntry,
    searchEntries
  };
};
