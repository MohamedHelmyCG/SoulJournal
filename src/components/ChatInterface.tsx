import { useState, useEffect, useRef } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useTranscription } from "../hooks/useTranscription";
import { useAIReflection } from "../hooks/useAIReflection";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  isStorySummary?: boolean;
}

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
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewText, setReviewText] = useState("");

  // Hooks
  const {
    isRecording,
    audioURL,
    startRecording,
    stopRecording,
    error: recorderError,
  } = useVoiceRecorder();

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
    error: transcriptionError,
  } = useTranscription();

  const {
    generateReflection,
    isGenerating: isAiGenerating,
    error: aiError,
  } = useAIReflection();

  // Add ref for message container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping, liveTranscript]);

  // Effects
  useEffect(() => {
    if (isListening) setLiveTranscript(transcript);
  }, [transcript, isListening]);

  useEffect(() => {
    if (!isContinuation && messages.length === 0) {
      setMessages([
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "I'm listening whenever you're ready to talk.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isContinuation, messages.length]);

  // Handlers
  const handleStartRecording = async () => {
    setLiveTranscript("");
    resetTranscript();
    setInputMode("voice");
    setIsReviewing(false);
    setReviewText("");
    try {
      await startRecording();
      setTimeout(() => startListening(), 300);
    } catch (err) {
      console.error("Recording start error:", err);
    }
  };

  const handleStopRecording = async () => {
    stopListening();
    try {
      await stopRecording();
      if (transcript.trim()) {
        setIsReviewing(true);
        setReviewText(transcript);
      }
    } catch (err) {
      console.error("Recording stop error:", err);
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewText.trim()) {
      await processUserMessage(reviewText);
      setIsReviewing(false);
      setReviewText("");
    }
  };

  const handleTypedMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typedMessage.trim()) {
      setTranscript(typedMessage); // Update transcript for consistency
      await processUserMessage(typedMessage);
      setTypedMessage("");
    }
  };

  const handleSaveConversation = async () => {
    if (messages.length <= 1) {
      onSaveConversation(messages, audioURL);
      return;
    }

    setIsAiTyping(true);
    try {
      // Prepare conversation history for summary
      const conversationText = messages
        .map((m) => `${m.sender}: ${m.text}`)
        .join("\n");

      console.log("Generating final summary...");
      const finalSummary = await generateReflection(conversationText, true);
      console.log("Received summary:", finalSummary);

      if (!finalSummary.summary && !finalSummary.response) {
        throw new Error("Empty summary from AI");
      }

      // Add the summary as the final AI message
      const summaryMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: "ai",
        text: finalSummary.summary || finalSummary.response,
        timestamp: new Date(),
        isStorySummary: true,
      };

      const finalMessages = [...messages, summaryMessage];
      onSaveConversation(finalMessages, audioURL);
    } catch (err) {
      console.error("Error generating summary:", err);
      // Still save the conversation without summary
      onSaveConversation(messages, audioURL);
    } finally {
      setIsAiTyping(false);
    }
  };

  const processUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLiveTranscript("");
    setIsAiTyping(true);

    try {
      console.log("Sending to Gemini:", text);
      const aiResponse = await generateReflection(text);
      console.log("Received from Gemini:", aiResponse);

      if (!aiResponse.response) {
        throw new Error("Empty response from AI");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: aiResponse.response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error("Error in processUserMessage:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "I apologize, but I'm having trouble understanding right now. Could you rephrase that or try again?",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Render
  return (
    <div className="flex flex-col h-screen w-full bg-[#F5F1EA]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E1D5] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <h2 className="text-xl font-semibold text-[#4A4036]">Soul Journal</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleSaveConversation}
            disabled={isRecording || isAiGenerating}
            className="px-3 py-1 bg-[#8B7355] text-white rounded-md hover:bg-[#6F5B45] disabled:opacity-50 transition-colors"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            disabled={isRecording}
            className="px-3 py-1 bg-[#C1666B] text-white rounded-md hover:bg-[#A34448] disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: "#F5F1EA" }}
      >
        <div className="max-w-3xl mx-auto py-4 px-4">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-[#8B7355] text-white"
                      : message.isStorySummary
                      ? "bg-[#E8E1D5] text-[#4A4036] italic"
                      : "bg-white text-[#4A4036]"
                  } shadow-sm`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isRecording && liveTranscript && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white text-[#4A4036] rounded-2xl px-4 py-3 animate-pulse shadow-sm">
                  {liveTranscript}
                </div>
              </div>
            )}

            {isAiTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-white text-[#4A4036] rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-[#8B7355] animate-bounce"></div>
                    <div
                      className="w-2 h-2 rounded-full bg-[#8B7355] animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-[#8B7355] animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Invisible element for scrolling */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Fixed Input Section */}
      <div className="border-t border-[#E8E1D5] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-3xl mx-auto p-4">
          {isReviewing ? (
            // Review and Edit Interface
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-[#6F5B45]">
                Review and edit your message:
              </div>
              <div className="flex space-x-2">
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="flex-1 min-h-[80px] px-4 py-2 rounded-lg border border-[#E8E1D5] bg-white focus:outline-none focus:ring-2 focus:ring-[#8B7355] resize-none"
                  placeholder="Edit your message..."
                />
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={handleReviewSubmit}
                    disabled={!reviewText.trim() || isAiTyping}
                    className="px-4 py-2 bg-[#8B7355] text-white rounded-lg hover:bg-[#6F5B45] disabled:opacity-50 transition-colors"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => {
                      setIsReviewing(false);
                      setReviewText("");
                    }}
                    className="px-4 py-2 bg-[#C1666B] text-white rounded-lg hover:bg-[#A34448] disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Text Input */}
              <form
                onSubmit={handleTypedMessageSubmit}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 h-12 px-4 rounded-lg border border-[#E8E1D5] bg-white focus:outline-none focus:ring-2 focus:ring-[#8B7355]"
                  disabled={isRecording || isAiTyping}
                />
                <button
                  type="submit"
                  disabled={!typedMessage.trim() || isRecording || isAiTyping}
                  className="px-6 h-12 bg-[#8B7355] text-white rounded-lg hover:bg-[#6F5B45] disabled:opacity-50 transition-colors"
                >
                  Send
                </button>
              </form>

              {/* Voice Input */}
              <div className="flex justify-center">
                <button
                  onClick={
                    isRecording ? handleStopRecording : handleStartRecording
                  }
                  disabled={isAiTyping}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isRecording
                      ? "bg-[#C1666B] text-white animate-pulse"
                      : "bg-[#8B7355] text-white"
                  } hover:opacity-90 disabled:opacity-50 transition-all shadow-md`}
                >
                  {isRecording ? "■" : "●"}
                </button>
              </div>
            </div>
          )}

          {/* Errors */}
          {(recorderError || transcriptionError || aiError) && (
            <div className="mt-2 p-3 bg-[#C1666B]/10 text-[#C1666B] rounded-lg text-sm">
              {recorderError || transcriptionError || aiError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
