import { useState } from "react";
import { JournalEntry } from "../hooks/useJournalStorage";
import { useAuth } from "../hooks/useFirebaseAuth";

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
  const { user, logout } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-lg shadow-sm p-4">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-[#4A4036]">Soul Journal</h1>
          <div className="flex space-x-2">
            <button
              onClick={onNewEntry}
              className="px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6F5B45] transition-colors"
            >
              New Entry
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-[#C1666B] text-white rounded-lg hover:bg-[#A34448] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="text-sm text-[#6F5B45]">
          Logged in as: {user?.email}
        </div>
      </div>

      {/* Search and Entries Section */}
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-lg shadow-sm p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-3 border border-[#E8E1D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] bg-white"
          />
        </div>

        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-[#6F5B45]">
              <p>No journal entries yet.</p>
              <p className="text-sm mt-2">
                Start a new conversation to begin your journal!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onSelectEntry(entry.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-[#4A4036]">
                    {entry.title}
                  </h3>
                  <span className="text-sm text-[#8B7355]">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-[#6F5B45] text-sm line-clamp-2">
                  {entry.lastMessage}
                </p>
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onContinueEntry(entry.id);
                    }}
                    className="text-sm px-3 py-1 bg-[#8B7355] text-white rounded-md hover:bg-[#6F5B45] transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteEntry(entry.id);
                    }}
                    className="text-sm px-3 py-1 bg-[#C1666B] text-white rounded-md hover:bg-[#A34448] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
