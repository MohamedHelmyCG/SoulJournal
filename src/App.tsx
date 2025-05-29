import { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { EntryList } from './components/EntryList';
import { AuthForm } from './components/AuthForm';
import { useJournalStorage, ChatMessage } from './hooks/useJournalStorage';
import { useAIReflection } from './hooks/useAIReflection';
import { AuthProvider, useAuth } from './hooks/useFirebaseAuth';
import './index.css';

function JournalApp() {
  const [view, setView] = useState<'list' | 'chat' | 'view'>('list');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isContinuation, setIsContinuation] = useState<boolean>(false);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  
  const { user, logout } = useAuth();
  const { 
    entries, 
    addEntry, 
    getEntry, 
    updateEntry, 
    continueConversation,
    deleteEntry, 
    searchEntries 
  } = useJournalStorage();
  
  const { generateReflection } = useAIReflection();

  const filteredEntries = searchQuery ? searchEntries(searchQuery) : entries;
  
  // Sort entries by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleSaveConversation = (messages: ChatMessage[], audioUrl: string | null) => {
    if (isContinuation && selectedEntryId) {
      // Continue existing conversation
      continueConversation(selectedEntryId, messages.slice(initialMessages.length));
    } else {
      // Create new entry
      addEntry({
        title: '', // Will be generated from conversation
        conversation: messages,
        audioUrl
      });
    }
    
    // Reset state and go back to list
    setIsContinuation(false);
    setInitialMessages([]);
    setView('list');
  };

  const handleSelectEntry = (id: string) => {
    setSelectedEntryId(id);
    setView('view');
  };

  const handleContinueConversation = (id: string) => {
    const entry = getEntry(id);
    if (entry) {
      setSelectedEntryId(id);
      setInitialMessages(entry.conversation);
      setIsContinuation(true);
      setView('chat');
    }
  };

  const handleStartNewChat = () => {
    setSelectedEntryId(null);
    setInitialMessages([]);
    setIsContinuation(false);
    setView('chat');
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    setView('list');
  };

  const renderView = () => {
    switch (view) {
      case 'list':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Voice Journal</h1>
              <div className="flex space-x-2">
                <button
                  onClick={handleStartNewChat}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-90 transition-colors"
                >
                  New Entry
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Logged in as: {user?.email}
            </div>
            <EntryList 
              entries={sortedEntries} 
              onSelectEntry={handleSelectEntry}
              onContinueConversation={handleContinueConversation}
              onSearchChange={setSearchQuery}
            />
          </div>
        );
        
      case 'chat':
        return (
          <ChatInterface 
            onSaveConversation={handleSaveConversation} 
            onCancel={() => setView('list')}
            initialMessages={initialMessages}
            isContinuation={isContinuation}
          />
        );
        
      case 'view':
        const entry = selectedEntryId ? getEntry(selectedEntryId) : null;
        
        if (!entry) {
          return (
            <div className="text-center py-8">
              <p className="text-red-500">Entry not found</p>
              <button
                onClick={() => setView('list')}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-90 transition-colors"
              >
                Back to List
              </button>
            </div>
          );
        }
        
        return (
          <div className="bg-accent bg-opacity-30 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <button 
                onClick={() => setView('list')}
                className="text-primary hover:text-opacity-80 flex items-center"
              >
                <span className="mr-1">←</span> Back
              </button>
              <span className="text-gray-500">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{entry.title}</h2>
            
            {/* Conversation Display */}
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto p-4 bg-background rounded-lg">
              {entry.conversation.map((message) => (
                <div
                  key={message.id}
                  className={`message-bubble ${
                    message.sender === 'user' ? 'user-message' : 'ai-message'
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            
            {/* Audio Playback */}
            {entry.audioUrl && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Audio Recording</h3>
                <audio src={entry.audioUrl} controls className="w-full" />
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => handleContinueConversation(entry.id)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-opacity-90 transition-colors"
              >
                Continue Conversation
              </button>
              <button
                onClick={() => handleDeleteEntry(entry.id)}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-opacity-90 transition-colors"
              >
                Delete Entry
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        {renderView()}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [authSuccess, setAuthSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Voice Journal</h1>
            <p className="text-gray-600 mt-2">Record, reflect, and grow with your personal voice journal</p>
          </div>
          <AuthForm onSuccess={() => setAuthSuccess(true)} />
        </div>
      </div>
    );
  }

  return <JournalApp />;
}

export default App;
