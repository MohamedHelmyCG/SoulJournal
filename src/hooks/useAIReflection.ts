import { useState, useEffect } from 'react';

// Types for emotional analysis
type EmotionCategory = 'positive' | 'negative' | 'neutral' | 'mixed';
type EmotionIntensity = 'low' | 'medium' | 'high';
type EmotionType = 
  | 'joy' | 'gratitude' | 'serenity' | 'interest' | 'hope' | 'pride' | 'amusement' | 'inspiration'  // positive
  | 'sadness' | 'anxiety' | 'fear' | 'frustration' | 'anger' | 'shame' | 'disappointment' | 'grief' // negative
  | 'neutral' | 'confusion' | 'surprise' | 'contemplative';  // neutral/mixed

interface EmotionAnalysis {
  category: EmotionCategory;
  intensity: EmotionIntensity;
  primaryEmotion: EmotionType;
  secondaryEmotion?: EmotionType;
}

interface TherapeuticResponse {
  reflection: string;
  question?: string;
}

interface UseAIReflectionReturn {
  generateReflection: (transcript: string, conversationHistory: string[]) => Promise<TherapeuticResponse>;
  isGenerating: boolean;
  error: string | null;
}

export const useAIReflection = (): UseAIReflectionReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze the emotional content of the text
  const analyzeEmotion = (text: string): EmotionAnalysis => {
    const lowerText = text.toLowerCase();
    
    // Simple keyword-based emotion detection
    // In a production app, this would be replaced with a more sophisticated NLP model
    
    // Positive emotion keywords
    const joyWords = ['happy', 'joy', 'delighted', 'thrilled', 'excited', 'wonderful', 'great'];
    const gratitudeWords = ['grateful', 'thankful', 'appreciate', 'blessed', 'thank you'];
    const hopeWords = ['hope', 'looking forward', 'optimistic', 'better future', 'positive'];
    const prideWords = ['proud', 'accomplished', 'achievement', 'success', 'managed to'];
    
    // Negative emotion keywords
    const sadnessWords = ['sad', 'unhappy', 'depressed', 'down', 'blue', 'heartbroken', 'miss'];
    const anxietyWords = ['anxious', 'worried', 'nervous', 'stress', 'overwhelmed', 'panic'];
    const angerWords = ['angry', 'frustrated', 'annoyed', 'mad', 'irritated', 'furious'];
    const fearWords = ['afraid', 'scared', 'terrified', 'fear', 'dread', 'worried about'];
    
    // Neutral/reflective keywords
    const contemplativeWords = ['thinking', 'wondering', 'reflecting', 'considering', 'pondering'];
    const confusionWords = ['confused', 'unsure', 'uncertain', 'don\'t understand', 'unclear'];
    
    // Count occurrences of emotion words
    const emotionCounts: Record<EmotionType, number> = {
      joy: joyWords.filter(word => lowerText.includes(word)).length,
      gratitude: gratitudeWords.filter(word => lowerText.includes(word)).length,
      serenity: 0, // More complex to detect
      interest: 0, // More complex to detect
      hope: hopeWords.filter(word => lowerText.includes(word)).length,
      pride: prideWords.filter(word => lowerText.includes(word)).length,
      amusement: 0, // More complex to detect
      inspiration: 0, // More complex to detect
      
      sadness: sadnessWords.filter(word => lowerText.includes(word)).length,
      anxiety: anxietyWords.filter(word => lowerText.includes(word)).length,
      fear: fearWords.filter(word => lowerText.includes(word)).length,
      frustration: 0, // More complex to detect
      anger: angerWords.filter(word => lowerText.includes(word)).length,
      shame: 0, // More complex to detect
      disappointment: 0, // More complex to detect
      grief: 0, // More complex to detect
      
      neutral: 0, // Default
      confusion: confusionWords.filter(word => lowerText.includes(word)).length,
      surprise: 0, // More complex to detect
      contemplative: contemplativeWords.filter(word => lowerText.includes(word)).length
    };
    
    // Calculate total positive and negative emotions
    const positiveEmotions = [
      emotionCounts.joy, emotionCounts.gratitude, emotionCounts.serenity,
      emotionCounts.interest, emotionCounts.hope, emotionCounts.pride,
      emotionCounts.amusement, emotionCounts.inspiration
    ];
    
    const negativeEmotions = [
      emotionCounts.sadness, emotionCounts.anxiety, emotionCounts.fear,
      emotionCounts.frustration, emotionCounts.anger, emotionCounts.shame,
      emotionCounts.disappointment, emotionCounts.grief
    ];
    
    const neutralEmotions = [
      emotionCounts.neutral, emotionCounts.confusion,
      emotionCounts.surprise, emotionCounts.contemplative
    ];
    
    const positiveScore = positiveEmotions.reduce((sum, val) => sum + val, 0);
    const negativeScore = negativeEmotions.reduce((sum, val) => sum + val, 0);
    const neutralScore = neutralEmotions.reduce((sum, val) => sum + val, 0);
    
    // Determine primary emotion category
    let category: EmotionCategory;
    if (positiveScore > negativeScore && positiveScore > neutralScore) {
      category = 'positive';
    } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
      category = 'negative';
    } else if (neutralScore > positiveScore && neutralScore > negativeScore) {
      category = 'neutral';
    } else {
      category = 'mixed';
    }
    
    // Find primary emotion
    const allEmotions = { ...emotionCounts };
    const primaryEmotionName = Object.keys(allEmotions).reduce((a, b) => 
      allEmotions[a as EmotionType] > allEmotions[b as EmotionType] ? a : b
    ) as EmotionType;
    
    // If no clear emotion is detected, default to neutral or contemplative
    const primaryEmotion = allEmotions[primaryEmotionName] > 0 
      ? primaryEmotionName 
      : 'contemplative';
    
    // Determine intensity based on word count and repetition
    const totalEmotionWords = positiveScore + negativeScore;
    let intensity: EmotionIntensity = 'low';
    
    if (totalEmotionWords >= 5) {
      intensity = 'high';
    } else if (totalEmotionWords >= 2) {
      intensity = 'medium';
    }
    
    return {
      category,
      intensity,
      primaryEmotion
    };
  };

  // Generate a therapeutic response based on emotional analysis
  const generateTherapeuticResponse = (
    emotionAnalysis: EmotionAnalysis, 
    transcript: string,
    conversationHistory: string[]
  ): TherapeuticResponse => {
    const { category, intensity, primaryEmotion } = emotionAnalysis;
    
    // Reflection templates based on emotion category
    const positiveReflections = [
      "I notice a sense of {{emotion}} in what you're sharing.",
      "There's a feeling of {{emotion}} coming through in your words.",
      "I can hear the {{emotion}} in your voice as you share this.",
      "Your words reflect a genuine sense of {{emotion}}.",
      "I'm hearing that this experience brought you {{emotion}}."
    ];
    
    const negativeReflections = [
      "I hear that you're experiencing some {{emotion}} right now.",
      "It sounds like there's a feeling of {{emotion}} as you talk about this.",
      "I'm sensing that this situation has brought up {{emotion}} for you.",
      "Your words convey a deep sense of {{emotion}}.",
      "I notice the {{emotion}} in what you're sharing, and that's completely valid."
    ];
    
    const neutralReflections = [
      "I hear you reflecting thoughtfully on this situation.",
      "You seem to be processing these experiences with careful consideration.",
      "I notice you're taking time to think through these circumstances.",
      "You're approaching this with a thoughtful perspective.",
      "I appreciate the way you're considering different aspects of this situation."
    ];
    
    // Questions based on emotion category
    const positiveQuestions = [
      "What about this experience was most meaningful to you?",
      "How has this positive experience shaped your perspective?",
      "What strengths did you discover in yourself through this?",
      "How might you build on this positive experience going forward?",
      "What does this success tell you about your capabilities?"
    ];
    
    const negativeQuestions = [
      "What would feel supportive for you right now?",
      "How have you coped with similar feelings in the past?",
      "What might be a small step toward easing this feeling?",
      "What would you say to a friend experiencing something similar?",
      "How can you show yourself compassion during this challenging time?"
    ];
    
    const neutralQuestions = [
      "What aspects of this situation stand out as most significant to you?",
      "How do you see this fitting into your broader life experience?",
      "What insights are emerging for you as you reflect on this?",
      "What feels important for you to explore further about this?",
      "How might this reflection influence your next steps?"
    ];
    
    // Achievement celebration responses
    const achievementResponses = [
      "This is truly worth celebrating. Your hard work and dedication have clearly paid off.",
      "What an accomplishment! It's important to take a moment to recognize what you've achieved.",
      "I'm struck by what you've managed to accomplish. This success speaks to your capabilities and perseverance.",
      "This achievement reflects your commitment and effort. It's wonderful to see your hard work bearing fruit.",
      "Your success here is meaningful and well-deserved. Take a moment to really acknowledge this accomplishment."
    ];
    
    // Select appropriate templates based on emotion category
    let reflectionTemplates: string[];
    let questionTemplates: string[];
    
    if (category === 'positive') {
      reflectionTemplates = positiveReflections;
      questionTemplates = positiveQuestions;
    } else if (category === 'negative') {
      reflectionTemplates = negativeReflections;
      questionTemplates = negativeQuestions;
    } else {
      reflectionTemplates = neutralReflections;
      questionTemplates = neutralQuestions;
    }
    
    // Check for achievement-related content
    const achievementWords = ['accomplish', 'achieve', 'success', 'complete', 'finish', 'proud', 'milestone', 'goal'];
    const isAchievement = achievementWords.some(word => transcript.toLowerCase().includes(word));
    
    // Select and personalize response
    let reflection: string;
    
    if (isAchievement) {
      reflection = achievementResponses[Math.floor(Math.random() * achievementResponses.length)];
    } else {
      const template = reflectionTemplates[Math.floor(Math.random() * reflectionTemplates.length)];
      reflection = template.replace('{{emotion}}', primaryEmotion);
    }
    
    // Add a second sentence for more depth
    const followUpReflections = [
      "This is something many people experience.",
      "I appreciate you sharing this with me.",
      "Your willingness to explore this shows real self-awareness.",
      "Taking time to reflect on this is valuable.",
      "It takes courage to look at these feelings so openly."
    ];
    
    reflection += " " + followUpReflections[Math.floor(Math.random() * followUpReflections.length)];
    
    // Select a question
    const question = questionTemplates[Math.floor(Math.random() * questionTemplates.length)];
    
    return {
      reflection,
      question
    };
  };

  // Main function to generate AI reflection
  const generateReflection = async (
    transcript: string,
    conversationHistory: string[] = []
  ): Promise<TherapeuticResponse> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Analyze emotional content
      const emotionAnalysis = analyzeEmotion(transcript);
      
      // Generate therapeutic response
      const response = generateTherapeuticResponse(
        emotionAnalysis, 
        transcript,
        conversationHistory
      );
      
      // Combine reflection and question
      const fullResponse: TherapeuticResponse = {
        reflection: response.reflection,
        question: response.question
      };
      
      return fullResponse;
    } catch (err) {
      setError('Failed to generate reflection. Please try again.');
      console.error('Error generating reflection:', err);
      return { 
        reflection: "I'm sorry, I'm having trouble processing that right now. Could we try again?" 
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
