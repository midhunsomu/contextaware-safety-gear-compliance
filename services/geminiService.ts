
import { GoogleGenAI, Type } from "@google/genai";
import { DetectionResult, ZoneType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSafetyContext = async (base64Image: string): Promise<DetectionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this monitoring camera frame for safety gear compliance.
            Determine if a worker is present.
            Determine if they are wearing a safety helmet.
            Classify the environment as either a 'High Risk Zone' (active construction, machinery, height hazards) or a 'Safe Zone' (walkway, office, break area).
            Provide a brief reasoning for the zone classification and gear detection.
            
            Return ONLY a valid JSON object with the following structure:
            {
              "workerPresent": boolean,
              "helmetPresent": boolean,
              "zoneType": "Safe Zone" | "High Risk Zone",
              "reasoning": "string explanation"
            }`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workerPresent: { type: Type.BOOLEAN },
            helmetPresent: { type: Type.BOOLEAN },
            zoneType: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          },
          required: ["workerPresent", "helmetPresent", "zoneType", "reasoning"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    const parsed = JSON.parse(resultText);
    
    return {
      ...parsed,
      zoneType: parsed.zoneType as ZoneType,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
