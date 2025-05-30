import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  audioURL: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  resetRecording: () => void;
  error: string | null;
}

export const useVoiceRecorder = (): UseVoiceRecorderReturn => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startRecording = useCallback(async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      });
      
      streamRef.current = stream;
      console.log('Microphone access granted, creating MediaRecorder');
      
      // Ensure we're using a supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType
      });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log('Data available from recorder', event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        console.log('MediaRecorder stopped, creating audio blob');
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        console.log('Audio URL created:', url);
      };
      
      // Request data every second to ensure we get chunks even during long recordings
      mediaRecorderRef.current.start(1000);
      console.log('MediaRecorder started');
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Microphone access denied or not available. Please check your browser permissions.');
      setIsRecording(false);
    }
  }, []);
  
  const stopRecording = useCallback(async () => {
    console.log('Stopping recording, current state:', { 
      isRecording, 
      hasMediaRecorder: !!mediaRecorderRef.current 
    });
    
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder stopped');
        
        // Stop all audio tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => {
            track.stop();
            console.log('Audio track stopped');
          });
        }
        
        setIsRecording(false);
      } catch (err) {
        console.error('Error stopping recording:', err);
        setError('Error stopping recording');
        setIsRecording(false);
      }
    }
  }, [isRecording]);
  
  const resetRecording = useCallback(() => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      console.log('Audio URL revoked');
    }
    setAudioURL(null);
    audioChunksRef.current = [];
  }, [audioURL]);
  
  return {
    isRecording,
    audioURL,
    startRecording,
    stopRecording,
    resetRecording,
    error
  };
};
