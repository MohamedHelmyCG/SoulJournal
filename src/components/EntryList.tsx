import { useState } from 'react';
import { ChatMessage } from '../hooks/useJournalStorage';

interface EntryListProps {
  entries: {
    id: string;
    title: string;
    date: string;
    lastMessage: string;
    conversation: ChatMessage[];
  }[];
  onSelectEntry: (id: string) => void;
  onContinueConversation: (id: string) => void;
  onSearchChange: (query: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({ 
  entries, 
  onSelectEntry,
  onContinueConversation,
  onSearchChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get excerpt from transcript
  const getExcerpt = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-accent bg-opacity-30 rounded-lg shadow-md p-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-2 border border-secondary border-opacity-30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No journal entries yet.</p>
            <p className="text-sm mt-2">Start a new conversation to begin your journal!</p>
          </div>
        ) : (
          entries.map(entry => (
            <div 
              key={entry.id}
              className="journal-entry-card p-3 hover:bg-accent hover:bg-opacity-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-gray-600">
                  {formatDate(entry.date)}
                </span>
              </div>
              <h3 className="font-medium text-gray-800 mb-1">{entry.title}</h3>
              <p className="text-gray-700 line-clamp-2 text-sm">{getExcerpt(entry.lastMessage)}</p>
              
              <div className="flex justify-end mt-2 space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinueConversation(entry.id);
                  }}
                  className="text-xs px-2 py-1 bg-secondary bg-opacity-30 text-gray-700 rounded hover:bg-opacity-50 transition-colors"
                >
                  Continue
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectEntry(entry.id);
                  }}
                  className="text-xs px-2 py-1 bg-primary bg-opacity-30 text-gray-700 rounded hover:bg-opacity-50 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
