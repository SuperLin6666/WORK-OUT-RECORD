
import { GoogleGenAI } from "@google/genai";
import { WorkoutType, GripType } from "../types";

export const getWorkoutMotivation = async (
  duration: number, 
  status: 'START' | 'FINISH', 
  type: WorkoutType = 'RUN',
  grip?: GripType,
  reps?: number
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  let prompt = "";
  if (type === 'RUN') {
    prompt = status === 'START' 
      ? `Give me a high-energy, one-sentence motivational quote for someone about to start a ${duration} minute run.`
      : `Give me a one-sentence recovery tip for someone who just finished a ${duration} minute run.`;
  } else {
    const gripName = grip === 'OVERHAND' ? 'Overhand (正面)' : 'Underhand (反面)';
    prompt = status === 'START'
      ? `Give me a punchy one-sentence tip for doing ${gripName} pull-ups. Focus on form or motivation.`
      : `Congratulate me on finishing ${reps} reps of ${gripName} pull-ups in one sentence. Add a tip for grip recovery.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });
    return response.text?.trim() || "Keep pushing your limits!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Great effort! Stay consistent.";
  }
};
