import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTranscriptionReturn {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
  setTranscript: (text: string) => void;
}

export const useTranscription = (): UseTranscriptionReturn => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to persist the recognition instance and track its state
  const recognitionRef = useRef<any>(null);
  const isRecognitionInitialized = useRef<boolean>(false);
  const lastTranscriptRef = useRef<string>('');
  const fullTranscriptRef = useRef<string>('');
  
  // Initialize the recognition instance once
  useEffect(() => {
    if (!isRecognitionInitialized.current) {
      try {
        if ('webkitSpeechRecognition' in window) {
          // @ts-ignore - TypeScript doesn't have types for the Web Speech API by default
          recognitionRef.current = new window.webkitSpeechRecognition();
          isRecognitionInitialized.current = true;
        } else if ('SpeechRecognition' in window) {
          // @ts-ignore
          recognitionRef.current = new window.SpeechRecognition();
          isRecognitionInitialized.current = true;
        } else {
          console.error('Speech recognition not supported in this browser');
          setError('Speech recognition not supported in this browser');
        }
        
        if (recognitionRef.current) {
          // Configure the recognition instance
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';
          
          // Set up event handlers
          recognitionRef.current.onstart = () => {
            setIsListening(true);
            setError(null);
            console.log('Speech recognition started');
          };
          
          recognitionRef.current.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                // Only add to final transcript if it's not a duplicate
                if (transcript !== lastTranscriptRef.current) {
                  finalTranscript += transcript;
                  lastTranscriptRef.current = transcript;
                  // Append to full transcript with proper spacing
                  if (fullTranscriptRef.current && !fullTranscriptRef.current.endsWith(' ')) {
                    fullTranscriptRef.current += ' ';
                  }
                  fullTranscriptRef.current += transcript;
                }
                console.log('Final transcript:', finalTranscript);
              } else {
                interimTranscript += transcript;
                console.log('Interim transcript:', interimTranscript);
              }
            }
            
            if (finalTranscript) {
              setTranscript(fullTranscriptRef.current.trim());
            } else if (interimTranscript) {
              // Show interim results while maintaining the full transcript
              setTranscript(fullTranscriptRef.current + ' ' + interimTranscript);
            }
          };
          
          recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setError(`Error during transcription: ${event.error}`);
          };
          
          recognitionRef.current.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
          };
        }
      } catch (err) {
        console.error('Error initializing speech recognition:', err);
        setError('Failed to initialize speech recognition');
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors when stopping on unmount
        }
      }
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }
    
    try {
      recognitionRef.current.start();
      console.log('Attempting to start speech recognition');
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      
      // If already started, try stopping first then starting again
      if (err instanceof DOMException && err.name === 'InvalidStateError') {
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            recognitionRef.current.start();
          }, 100);
        } catch (stopErr) {
          setError('Failed to restart speech recognition');
        }
      } else {
        setError('Failed to start speech recognition');
      }
    }
  }, []);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
        console.log('Stopping speech recognition');
      } catch (err) {
        console.error('Error stopping speech recognition:', err);
      }
    }
  }, [isListening]);
  
  const resetTranscript = useCallback(() => {
    setTranscript('');
    lastTranscriptRef.current = '';
    fullTranscriptRef.current = '';
  }, []);

  // Allow manual transcript setting (for typing)
  const setTranscriptText = useCallback((text: string) => {
    setTranscript(text);
    fullTranscriptRef.current = text;
  }, []);
  
  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error,
    setTranscript: setTranscriptText
  };
};
