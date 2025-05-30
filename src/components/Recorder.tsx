import { useState } from "react";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { useTranscription } from "../hooks/useTranscription";

interface RecorderProps {
  onSave: (audioUrl: string | null, transcript: string) => void;
  onCancel: () => void;
}

export const Recorder: React.FC<RecorderProps> = ({ onSave, onCancel }) => {
  const [recordingStep, setRecordingStep] = useState<
    "idle" | "recording" | "recorded"
  >("idle");
  const {
    isRecording,
    audioURL,
    startRecording,
    stopRecording,
    resetRecording,
    error: recorderError,
  } = useVoiceRecorder();

  const {
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error: transcriptionError,
  } = useTranscription();

  const handleStartRecording = async () => {
    await startRecording();
    startListening();
    setRecordingStep("recording");
  };

  const handleStopRecording = async () => {
    await stopRecording();
    stopListening();
    setRecordingStep("recorded");
  };

  const handleSave = () => {
    onSave(audioURL, transcript);
    resetRecording();
    resetTranscript();
    setRecordingStep("idle");
  };

  const handleCancel = () => {
    resetRecording();
    resetTranscript();
    setRecordingStep("idle");
    onCancel();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">
          {recordingStep === "idle" && "What's on your mind today?"}
          {recordingStep === "recording" && "I'm listening..."}
          {recordingStep === "recorded" && "I heard you say:"}
        </h2>
      </div>

      {/* Microphone Button with Animation */}
      <div className="flex justify-center mb-6">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={recordingStep === "recorded"}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? "bg-red-500 animate-pulse"
              : recordingStep === "recorded"
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          <span className="text-white text-3xl">{isRecording ? "■" : "●"}</span>

          {/* Pulse Animation Rings */}
          {isRecording && (
            <>
              <span className="absolute w-full h-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
              <span className="absolute w-[110%] h-[110%] rounded-full bg-red-400 opacity-50 animate-ping animation-delay-300"></span>
            </>
          )}
        </button>
      </div>

      {/* Transcript Display */}
      {(transcript || recordingStep === "recorded") && (
        <div className="mb-6">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[100px] max-h-[200px] overflow-y-auto">
            {transcript ? (
              transcript
            ) : (
              <span className="text-gray-400">No speech detected</span>
            )}
          </div>
        </div>
      )}

      {/* Audio Playback */}
      {audioURL && (
        <div className="mb-6 flex justify-center">
          <audio src={audioURL} controls className="w-full max-w-md" />
        </div>
      )}

      {/* Error Messages */}
      {(recorderError || transcriptionError) && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {recorderError || transcriptionError}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>

        {recordingStep === "recorded" && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Save Entry
          </button>
        )}
      </div>
    </div>
  );
};
