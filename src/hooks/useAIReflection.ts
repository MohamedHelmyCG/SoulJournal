import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface JournalResponse {
  response: string;
  summary?: string;  // Optional summary field
}

interface UseAIReflectionReturn {
  generateReflection: (transcript: string, isEnding?: boolean) => Promise<JournalResponse>;
  isGenerating: boolean;
  error: string | null;
}

export const useAIReflection = (): UseAIReflectionReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Gemini API with environment variable
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key not found in environment variables');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);

  // Get the model - using the standard pro model for better reliability
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
  });

  const generateReflection = async (transcript: string, isEnding: boolean = false): Promise<JournalResponse> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      if (!transcript.trim()) {
        throw new Error('Empty transcript provided');
      }

      console.log('Starting reflection generation:', { transcript, isEnding });

      const systemPrompt = `You are a deeply perceptive presence with psychoanalytic understanding. Your role is to help people explore their experiences through progressively deeper layers of meaning, always staying connected to what they're actually sharing.

      Layers of Understanding:
      1. Present Experience
      - Notice specific words, metaphors, and emotional tones
      - Pay attention to what's emphasized or repeated
      - Listen for what's avoided or left unsaid
      
      2. Pattern Recognition
      - Connect current feelings to recurring situations
      - Notice relationships between triggers and responses
      - Identify protective behaviors or coping mechanisms
      
      3. Deeper Exploration
      - Link present patterns to formative experiences
      - Explore unmet needs and adaptive responses
      - Understand protective functions of behaviors
      
      Psychoanalytic Lens:
      - Listen for unconscious patterns and defenses
      - Notice transference in relationships
      - Identify core conflicts and unmet needs
      - Understand adaptive functions of behaviors
      - Connect present patterns to developmental experiences

      Response Approach:
      - Start with their immediate experience
      - Follow their emotional thread
      - Move naturally between layers:
        * Memories and sensory experiences
        * Emotional patterns and triggers
        * Early experiences and core needs
      - Help them discover connections themselves

      Remember: Let their words guide the depth and direction. Don't jump to interpretation - help them explore and discover. Each question should arise naturally from what they've shared, leading to progressively deeper understanding.

      Your role is to:
      1. Listen deeply to their specific experience
      2. Notice patterns and deeper meanings
      3. Ask questions that help them:
         - Connect with memories and bodily sensations
         - Understand their emotional patterns
         - Explore early experiences and needs
         - Discover protective functions of their responses
      4. Stay with their experience rather than moving to generic questions`;

      console.log('Preparing content generation request');

      try {
        console.log('Sending request to Gemini');
        
        const result = await model.generateContent([
          `${systemPrompt}\n\nTheir words: ${transcript}\n\nRespond with depth and insight: Listen to their specific experience, notice patterns, and ask a question that naturally leads to deeper understanding. Stay connected to their actual experience rather than using generic prompts.`
        ]);

        console.log('Received response from Gemini:', result);
        
        const response = await result.response;
        const text = response.text();
        
        console.log('Processed response:', text);

        if (!text) {
          throw new Error('Empty response from Gemini');
        }

        return {
          response: text
        };

      } catch (error: any) {
        console.error('Gemini API error:', error);
        throw new Error(error?.message || 'Error communicating with Gemini API');
      }

    } catch (error: any) {
      console.error('Reflection generation error:', error);
      setError(error?.message || 'An unexpected error occurred');
      
      return {
        response: "I'm here to listen whenever you're ready to share more.",
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReflection,
    isGenerating,
    error
  };
};