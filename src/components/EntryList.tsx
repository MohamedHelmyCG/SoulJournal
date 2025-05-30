import { useState } from "react";
import { JournalEntry } from "../hooks/useJournalStorage";

interface EntryListProps {
  entries: JournalEntry[];
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onContinueEntry: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onSearch: (query: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({
  entries,
  onSelectEntry,
  onNewEntry,
  onContinueEntry,
  onDeleteEntry,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#4A4036]">
          Your Journal Entries
        </h1>
        <button
          onClick={onNewEntry}
          className="px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6F5B45] transition-colors"
        >
          New Entry
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search entries..."
          className="w-full px-4 py-2 rounded-lg border border-[#E8E1D5] focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {entries.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No entries yet. Start by creating a new entry!
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div
                  className="flex-1 mr-4"
                  onClick={() => onSelectEntry(entry.id)}
                >
                  <h3 className="font-medium text-[#4A4036] mb-1">
                    {entry.title || "Untitled Entry"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onContinueEntry(entry.id);
                    }}
                    className="px-3 py-1 text-sm bg-[#8B7355] text-white rounded-md hover:bg-[#6F5B45] transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(entry.id);
                    }}
                    className="px-3 py-1 text-sm bg-[#C1666B] text-white rounded-md hover:bg-[#A34448] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {entry.conversation && entry.conversation.length > 0 && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {entry.conversation[0].text}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
