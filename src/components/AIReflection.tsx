import { useState } from "react";

export const useAIReflection = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReflection = async (transcript: string): Promise<string> => {
    setIsGenerating(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      if (!apiKey) throw new Error("API key not configured");

      const response = await fetch(
        "https://api.deepseek.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content: `You're having a voice conversation. Respond naturally:
              
              1. Keep responses conversational (1-2 sentences)
              2. Focus on active listening
              3. Sometimes ask open-ended questions
              4. Never suggest writing
              5. Use casual language with occasional empathy markers
              
              Good responses:
              - "That sounds tough. What's making this particularly hard right now?"
              - "I hear the frustration in your voice. Tell me more about that."
              - "Interesting. How long have you been feeling this way?"`,
              },
              {
                role: "user",
                content: transcript,
              },
            ],
            temperature: 0.7,
            max_tokens: 100,
          }),
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      setError("Let me think about that again");
      console.error("AI error:", err);
      return "I missed that last part. Could you say it again?";
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateReflection,
    isGenerating,
    error,
  };
};
