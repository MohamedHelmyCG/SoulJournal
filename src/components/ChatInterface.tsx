import { useState, useEffect } from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useTranscription } from '../hooks/useTranscription';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSaveConversation: (messages: ChatMessage[], audioUrl: string | null) => void;
  onCancel: () => void;
  initialMessages?: ChatMessage[];
  isContinuation?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSaveConversation,
  onCancel,
  initialMessages = [],
  isContinuation = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  
  const { 
    isRecording, 
    audioURL, 
    startRecording, 
    stopRecording, 
    resetRecording, 
    error: recorderError 
  } = useVoiceRecorder();
  
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    resetTranscript, 
    error: transcriptionError 
  } = useTranscription();

  // Update live transcript as user speaks
  useEffect(() => {
    if (isListening) {
      setLiveTranscript(transcript);
    }
  }, [transcript, isListening]);

  // Initial greeting if this is a new conversation
  useEffect(() => {
    if (!isContinuation && messages.length === 0) {
      const greeting = {
        id: Date.now().toString(),
        sender: 'ai' as const,
        text: "What's on your mind today? I'm here to listen and reflect with you.",
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [isContinuation, messages.length]);

  const handleStartRecording = async () => {
    setLiveTranscript('');
    resetTranscript();
    await startRecording();
    startListening();
  };

  const handleStopRecording = async () => {
    await stopRecording();
    stopListening();
    
    if (transcript.trim()) {
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: transcript,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setLiveTranscript('');
      
      // Simulate AI thinking and responding
      setIsAiTyping(true);
      setTimeout(() => {
        generateAIResponse(transcript);
      }, 1500);
    }
  };

  const generateAIResponse = (userInput: string) => {
    // This is a placeholder for the actual AI response generation
    // Will be replaced with more sophisticated logic in the next step
    
    const responses = [
      "I hear that you're feeling quite reflective today. What aspects of this situation do you find most challenging?",
      "That sounds meaningful. How did that experience affect your perspective?",
      "I'm noticing some strong emotions in what you're sharing. How have you been taking care of yourself through this?",
      "Thank you for sharing that with me. What would feel like a small step forward from where you are now?",
      "I appreciate your openness. What patterns do you notice when you reflect on similar situations?",
      "That's really insightful. How might you approach this differently if you were advising a friend?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const aiMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: randomResponse,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsAiTyping(false);
  };

  const handleSaveConversation = () => {
    onSaveConversation(messages, audioURL);
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-3xl mx-auto bg-background rounded-lg shadow-md overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
        <h2 className="text-xl font-semibold">Voice Journal</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSaveConversation}
            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md hover:bg-opacity-90 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-accent text-accent-foreground rounded-md hover:bg-opacity-90 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.sender === 'user' ? 'user-message' : 'ai-message'
              }`}
            >
              {message.text}
            </div>
          ))}
          
          {/* Live Transcript */}
          {isRecording && liveTranscript && (
            <div className="live-transcript">
              {liveTranscript}
            </div>
          )}
          
          {/* AI Typing Indicator */}
          {isAiTyping && (
            <div className="message-bubble ai-message" style={{ padding: '10px' }}>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Recording Controls */}
      <div className="p-4 border-t border-border bg-accent bg-opacity-30 flex items-center justify-center">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`mic-button ${isRecording ? 'recording' : ''}`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <span className="text-white text-2xl">
            {isRecording ? '■' : '●'}
          </span>
        </button>
      </div>
      
      {/* Error Messages */}
      {(recorderError || transcriptionError) && (
        <div className="p-3 m-4 bg-destructive bg-opacity-10 text-destructive rounded-md text-sm">
          {recorderError || transcriptionError}
        </div>
      )}
    </div>
  );
};
