import { useState, useEffect } from "react";
import { ChatInterface } from "./components/ChatInterface";
import { EntryList } from "./components/EntryList";
import { AuthForm } from "./components/AuthForm";
import { useJournalStorage, ChatMessage } from "./hooks/useJournalStorage";
import { AuthProvider, useAuth } from "./hooks/useFirebaseAuth";
import "./index.css";

function JournalApp() {
  const [view, setView] = useState<"list" | "chat" | "view">("list");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isContinuation, setIsContinuation] = useState<boolean>(false);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const { user } = useAuth();
  const {
    entries,
    addEntry,
    getEntry,
    deleteEntry,
    searchEntries,
    continueConversation,
  } = useJournalStorage();

  const filteredEntries = searchQuery ? searchEntries(searchQuery) : entries;

  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  useEffect(() => {
    if (!isContinuation && messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "What's on your mind today?",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isContinuation, messages.length]);

  const handleSaveConversation = async (
    messages: ChatMessage[],
    audioUrl: string | null
  ) => {
    if (isContinuation && selectedEntryId) {
      // Continue existing conversation
      continueConversation(
        selectedEntryId,
        messages.slice(initialMessages.length)
      );
    } else {
      // Create new entry
      addEntry({
        title: "", // Will be generated from conversation
        conversation: messages,
        audioUrl,
      });
    }

    // Reset state and go back to list
    setIsContinuation(false);
    setInitialMessages([]);
    setView("list");
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntryId(id);
    setView("view");
  };

  const handleContinueConversation = (id: string) => {
    const entry = getEntry(id);
    if (entry) {
      setSelectedEntryId(id);
      setInitialMessages(entry.conversation);
      setIsContinuation(true);
      setView("chat");
    }
  };

  const handleStartNewChat = () => {
    setSelectedEntryId(null);
    setInitialMessages([]);
    setIsContinuation(false);
    setView("chat");
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#F5F1EA]">
      {!user ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <AuthForm onSuccess={() => {}} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          {view === "list" ? (
            <div className="flex-1 max-w-6xl w-full mx-auto p-4">
              <EntryList
                entries={sortedEntries}
                onSelectEntry={handleSelectEntry}
                onNewEntry={handleStartNewChat}
                onContinueEntry={handleContinueConversation}
                onDeleteEntry={deleteEntry}
                onSearch={setSearchQuery}
              />
            </div>
          ) : (
            <div className="flex-1 h-full">
              <ChatInterface
                onSaveConversation={handleSaveConversation}
                onCancel={() => {
                  setView("list");
                  setIsContinuation(false);
                  setInitialMessages([]);
                }}
                initialMessages={initialMessages}
                isContinuation={isContinuation}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <JournalApp />
    </AuthProvider>
  );
}

export default App;
