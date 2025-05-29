import { useState } from 'react';
import { JournalEntry } from '../types/journal';

interface EntryViewProps {
  entry: JournalEntry;
  onBack: () => void;
  onDelete: (id: string) => void;
}

export const EntryView: React.FC<EntryViewProps> = ({ entry, onBack, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(entry.id);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack}
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <span className="mr-1">←</span> Back
        </button>
        <span className="text-gray-500">{formatDate(entry.date)}</span>
      </div>

      {/* Audio Playback */}
      {entry.audioUrl && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Audio Recording</h3>
          <audio src={entry.audioUrl} controls className="w-full" />
        </div>
      )}

      {/* Transcript */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Transcript</h3>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px]">
          {entry.transcript}
        </div>
      </div>

      {/* AI Reflection */}
      {entry.reflection && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Reflection</h3>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 min-h-[100px] italic">
            {entry.reflection}
          </div>
        </div>
      )}

      {/* Mood */}
      {entry.mood && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Mood</h3>
          <div className="text-2xl">
            {entry.mood}
          </div>
        </div>
      )}

      {/* Delete Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleDelete}
          className={`px-4 py-2 rounded-md transition-colors ${
            confirmDelete 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {confirmDelete ? 'Confirm Delete' : 'Delete Entry'}
        </button>
      </div>
    </div>
  );
};
