import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../hooks/useJournalStorage";
import { useAIReflection } from "../hooks/useAIReflection";
import { useRecorder } from "../hooks/useRecorder";
import { useTranscription } from "../hooks/useTranscription";

interface ChatInterfaceProps {
  onSaveConversation: (
    messages: ChatMessage[],
    audioUrl: string | null
  ) => void;
  onCancel: () => void;
  initialMessages?: ChatMessage[];
  isContinuation?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSaveConversation,
  onCancel,
  initialMessages = [],
  isContinuation = false,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hooks
  const {
    isRecording: recorderIsRecording,
    audioURL: recorderAudioURL,
    startRecording,
    stopRecording,
  } = useRecorder();

  const {
    transcript: transcriptionTranscript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript: setTranscriptionTranscript,
  } = useTranscription();

  const { generateReflection } = useAIReflection();

  // Effects
  useEffect(() => {
    if (isListening) setLiveTranscript(transcriptionTranscript);
  }, [transcriptionTranscript, isListening]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
      startListening();
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const handleStopRecording = async () => {
    try {
      stopListening();
      await stopRecording();
      if (transcriptionTranscript.trim()) {
        setIsReviewing(true);
        setReviewText(transcriptionTranscript);
      }
    } catch (err) {
      console.error("Error stopping recording:", err);
    }
  };

  const processUserMessage = async (text: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Generate AI response
    setIsAiTyping(true);
    try {
      const aiResponse = await generateReflection(text);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text:
          typeof aiResponse === "string"
            ? aiResponse
            : aiResponse.response || "I'm not sure how to respond to that.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("Error generating AI response:", err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I apologize, but I'm having trouble responding right now. Could you try rephrasing or asking something else?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSubmitReview = async () => {
    setIsReviewing(false);
    resetTranscript();
    await processUserMessage(reviewText);
    setReviewText("");
  };

  const handleSubmitTyped = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typedMessage.trim()) {
      setTranscriptionTranscript(typedMessage); // Update transcript for consistency
      await processUserMessage(typedMessage);
      setTypedMessage("");
    }
  };

  const handleSaveConversation = async () => {
    if (messages.length <= 1) {
      onSaveConversation(messages, recorderAudioURL);
      return;
    }

    setIsAiGenerating(true);
    try {
      // Generate a summary for the title
      const conversationText = messages
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join("\n");
      const summary = await generateReflection(
        `Please provide a very brief 3-5 word summary of this conversation that can serve as a title: ${conversationText}`
      );

      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "ai",
        text:
          typeof summary === "string"
            ? summary
            : summary.response || "Untitled Conversation",
        timestamp: new Date(),
      };

      const finalMessages = [...messages, summaryMessage];
      onSaveConversation(finalMessages, recorderAudioURL);
    } catch (err) {
      console.error("Error generating summary:", err);
      // Still save the conversation without summary
      onSaveConversation(messages, recorderAudioURL);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-[#E8E1D5] p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#4A4036]">
          {isContinuation ? "Continue Conversation" : "New Entry"}
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={handleSaveConversation}
            disabled={recorderIsRecording || isAiGenerating}
            className="px-3 py-1 bg-[#8B7355] text-white rounded-md hover:bg-[#6F5B45] disabled:opacity-50 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            disabled={recorderIsRecording}
            className="px-3 py-1 bg-[#C1666B] text-white rounded-md hover:bg-[#A34448] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                message.sender === "user"
                  ? "bg-[#8B7355] text-white"
                  : "bg-white text-[#4A4036]"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {recorderIsRecording && liveTranscript && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-white text-[#4A4036] rounded-2xl px-4 py-3 animate-pulse shadow-sm">
              {liveTranscript}
            </div>
          </div>
        )}

        {isAiTyping && (
          <div className="flex justify-start">
            <div className="max-w-[85%] bg-white text-[#4A4036] rounded-2xl px-4 py-3 animate-pulse shadow-sm">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Review Modal */}
      {isReviewing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-[#4A4036] mb-4">
              Review Your Message
            </h3>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full h-32 p-3 border border-[#E8E1D5] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsReviewing(false)}
                className="px-4 py-2 text-[#4A4036] hover:bg-[#F5F1EA] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6F5B45] transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-[#E8E1D5] p-4">
        <form onSubmit={handleSubmitTyped} className="flex space-x-2">
          <input
            type="text"
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 h-12 px-4 rounded-lg border border-[#E8E1D5] bg-white focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
            disabled={recorderIsRecording || isAiTyping}
          />
          <button
            type="submit"
            disabled={!typedMessage.trim() || recorderIsRecording || isAiTyping}
            className="px-6 h-12 bg-[#8B7355] text-white rounded-lg hover:bg-[#6F5B45] disabled:opacity-50 transition-colors"
          >
            Send
          </button>
          <button
            onClick={
              recorderIsRecording ? handleStopRecording : handleStartRecording
            }
            disabled={isAiTyping}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${
              recorderIsRecording
                ? "bg-[#C1666B] text-white animate-pulse"
                : "bg-[#8B7355] text-white"
            } hover:opacity-90 disabled:opacity-50 transition-all shadow-md`}
          >
            {recorderIsRecording ? "■" : "●"}
          </button>
        </form>
      </div>
    </div>
  );
};
