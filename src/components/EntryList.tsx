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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get excerpt from transcript
  const getExcerpt = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
                className="bg-white rounded-lg p-4 hover:bg-[#F5F1EA] cursor-pointer transition-colors border border-[#E8E1D5]"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium text-[#6F5B45]">
                    {formatDate(entry.date)}
                  </span>
                </div>
                <h3 className="font-medium text-[#4A4036] mb-1">
                  {entry.title}
                </h3>
                <p className="text-[#6F5B45] line-clamp-2 text-sm">
                  {getExcerpt(entry.lastMessage)}
                </p>

                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onContinueEntry(entry.id);
                    }}
                    className="text-sm px-3 py-1.5 bg-[#E8E1D5] text-[#4A4036] rounded-lg hover:bg-[#8B7355] hover:text-white transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEntry(entry.id);
                    }}
                    className="text-sm px-3 py-1.5 bg-[#8B7355] text-white rounded-lg hover:bg-[#6F5B45] transition-colors"
                  >
                    View
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
