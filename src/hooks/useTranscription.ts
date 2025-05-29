import { useState, useCallback } from 'react';

interface UseTranscriptionReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export const useTranscription = (): UseTranscriptionReturn => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Using the Web Speech API for transcription
  const recognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore - TypeScript doesn't have types for the Web Speech API by default
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US'; // Default to English, could be made configurable
      
      return recognitionInstance;
    }
    return null;
  }, []);
  
  const startListening = useCallback(() => {
    const recognitionInstance = recognition();
    
    if (!recognitionInstance) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
    };
    
    recognitionInstance.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      setTranscript(prevTranscript => prevTranscript + finalTranscript);
    };
    
    recognitionInstance.onerror = (event: any) => {
      setError(`Error during transcription: ${event.error}`);
      console.error('Speech recognition error:', event.error);
    };
    
    recognitionInstance.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognitionInstance.start();
    } catch (err) {
      setError('Failed to start speech recognition');
      console.error('Error starting speech recognition:', err);
    }
    
    return recognitionInstance;
  }, [recognition]);
  
  const stopListening = useCallback(() => {
    const recognitionInstance = recognition();
    if (recognitionInstance && isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    }
  }, [isListening, recognition]);
  
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);
  
  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};
