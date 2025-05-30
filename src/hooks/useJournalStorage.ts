import { useState, useEffect } from 'react';
import { useAuth } from './useFirebaseAuth';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  conversation: ChatMessage[];
  audioUrl: string | null;
  lastMessage: string;
}

interface UseJournalStorageReturn {
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'date' | 'lastMessage'>) => string;
  getEntry: (id: string) => JournalEntry | undefined;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => boolean;
  continueConversation: (id: string, newMessages: ChatMessage[]) => boolean;
  deleteEntry: (id: string) => boolean;
  searchEntries: (query: string) => JournalEntry[];
}

export const useJournalStorage = (): UseJournalStorageReturn => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const { user } = useAuth();

  // Get storage key for current user
  const getStorageKey = () => {
    return `journalEntries_${user?.uid || 'anonymous'}`;
  };

  // Load entries from localStorage on initial mount or when user changes
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(getStorageKey());
      if (storedEntries) {
        // Parse the stored entries and convert string dates back to Date objects for messages
        const parsedEntries = JSON.parse(storedEntries);
        
        // Process each entry to ensure proper date formatting for messages
        const processedEntries = parsedEntries.map((entry: any) => ({
          ...entry,
          conversation: entry.conversation.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        setEntries(processedEntries);
      } else {
        // Clear entries if no data found for current user
        setEntries([]);
      }
    } catch (error) {
      console.error('Error loading entries from localStorage:', error);
      setEntries([]); // Reset entries on error
    }
  }, [user?.uid]); // Reload when user changes

  // Save entries to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving entries to localStorage:', error);
    }
  }, [entries, user?.uid]);

  // Generate a title from the conversation content
  const generateTitle = (conversation: ChatMessage[]): string => {
    // Find the first user message
    const firstUserMessage = conversation.find(msg => msg.sender === 'user');
    
    if (!firstUserMessage) {
      return 'New Journal Entry';
    }
    
    // Extract first few words (up to 5) for the title
    const words = firstUserMessage.text.split(' ');
    const titleWords = words.slice(0, 5);
    let title = titleWords.join(' ');
    
    // Add ellipsis if truncated
    if (words.length > 5) {
      title += '...';
    }
    
    return title;
  };

  // Get the last message for preview purposes
  const getLastMessage = (conversation: ChatMessage[]): string => {
    if (conversation.length === 0) {
      return '';
    }
    
    // Get the last message in the conversation
    const lastMessage = conversation[conversation.length - 1];
    
    // Truncate if too long
    if (lastMessage.text.length > 100) {
      return lastMessage.text.substring(0, 100) + '...';
    }
    
    return lastMessage.text;
  };

  // Add a new entry
  const addEntry = (entry: Omit<JournalEntry, 'id' | 'date' | 'lastMessage'>): string => {
    const id = Date.now().toString();
    const title = generateTitle(entry.conversation);
    const lastMessage = getLastMessage(entry.conversation);
    
    const newEntry: JournalEntry = {
      ...entry,
      id,
      title,
      date: new Date().toISOString(),
      lastMessage
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

    // If conversation was updated, regenerate title and lastMessage
    if (updates.conversation) {
      updatedEntries[entryIndex].title = generateTitle(updates.conversation);
      updatedEntries[entryIndex].lastMessage = getLastMessage(updates.conversation);
    }

    setEntries(updatedEntries);
    return true;
  };

  // Continue an existing conversation
  const continueConversation = (id: string, newMessages: ChatMessage[]): boolean => {
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      return false;
    }

    const updatedEntries = [...entries];
    const updatedConversation = [
      ...updatedEntries[entryIndex].conversation,
      ...newMessages
    ];
    
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      conversation: updatedConversation,
      lastMessage: getLastMessage(updatedConversation)
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

  // Search entries by conversation content
  const searchEntries = (query: string): JournalEntry[] => {
    if (!query.trim()) {
      return entries;
    }

    const lowerCaseQuery = query.toLowerCase();
    return entries.filter(entry => {
      // Search in all messages
      return entry.conversation.some(message => 
        message.text.toLowerCase().includes(lowerCaseQuery)
      );
    });
  };

  return {
    entries,
    addEntry,
    getEntry,
    updateEntry,
    continueConversation,
    deleteEntry,
    searchEntries
  };
};
