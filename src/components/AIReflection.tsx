import { useState } from 'react';

interface AIReflectionProps {
  transcript: string;
  onReflectionGenerated: (reflection: string, suggestedMood: string) => void;
}

export const useAIReflection = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This is a mock implementation since we don't have actual OpenAI API integration
  // In a real implementation, this would call the OpenAI API
  const generateReflection = async (transcript: string): Promise<{reflection: string, mood: string}> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simple mock implementation to generate reflections based on keywords
      let reflection = '';
      let mood = '';
      
      const lowerTranscript = transcript.toLowerCase();
      
      // Very simple sentiment analysis
      if (lowerTranscript.includes('happy') || 
          lowerTranscript.includes('excited') || 
          lowerTranscript.includes('great')) {
        reflection = "I sense enthusiasm and positivity in your words today. Your energy seems uplifting, and it's wonderful to see you expressing joy. Consider building on this positive momentum in your day.";
        mood = "😊";
      } else if (lowerTranscript.includes('sad') || 
                lowerTranscript.includes('upset') || 
                lowerTranscript.includes('worried')) {
        reflection = "I notice some concern in your thoughts today. It's completely normal to have these feelings, and acknowledging them is an important step. Remember to be gentle with yourself during challenging moments.";
        mood = "😔";
      } else if (lowerTranscript.includes('angry') || 
                lowerTranscript.includes('frustrated') || 
                lowerTranscript.includes('annoyed')) {
        reflection = "I'm picking up on some frustration in your entry. These emotions are valid and it can be helpful to explore what's triggering them. Consider if there are constructive ways to address the underlying causes.";
        mood = "😠";
      } else if (lowerTranscript.includes('tired') || 
                lowerTranscript.includes('exhausted') || 
                lowerTranscript.includes('sleep')) {
        reflection = "Your entry suggests you might be experiencing fatigue. Rest is essential for wellbeing, both mentally and physically. Perhaps consider if there are ways to incorporate more restorative activities into your routine.";
        mood = "😴";
      } else {
        // Default reflection for when no specific sentiment is detected
        reflection = "Thank you for sharing your thoughts. Reflecting on our daily experiences helps us process emotions and gain insights. I notice you're taking time for self-reflection, which is a valuable practice for personal growth.";
        mood = "🤔";
      }
      
      // Add an affirming message at the end
      reflection += " Remember that your feelings are valid, and each journal entry is a step toward greater self-understanding.";
      
      return { reflection, mood };
    } catch (err) {
      setError('Failed to generate reflection. Please try again.');
      console.error('Error generating reflection:', err);
      return { reflection: '', mood: '' };
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

export const AIReflection: React.FC<AIReflectionProps> = ({ 
  transcript, 
  onReflectionGenerated 
}) => {
  const { generateReflection, isGenerating, error } = useAIReflection();
  const [reflection, setReflection] = useState<string>('');
  const [mood, setMood] = useState<string>('');

  const handleGenerateReflection = async () => {
    if (!transcript.trim()) return;
    
    const result = await generateReflection(transcript);
    
    if (result.reflection) {
      setReflection(result.reflection);
      setMood(result.mood);
      onReflectionGenerated(result.reflection, result.mood);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">AI Reflection</h3>
      
      {!reflection && (
        <button
          onClick={handleGenerateReflection}
          disabled={isGenerating || !transcript.trim()}
          className={`w-full py-3 rounded-md transition-colors ${
            isGenerating || !transcript.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isGenerating ? 'Generating reflection...' : 'Generate Reflection'}
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {reflection && (
        <div className="mt-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 min-h-[100px] italic">
            {reflection}
          </div>
          
          {mood && (
            <div className="mt-4 text-center">
              <span className="text-3xl">{mood}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
