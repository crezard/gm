import { GoogleGenAI, Type } from "@google/genai";
import { Question, UsageType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateQuestions = async (count: number, usageType: UsageType): Promise<Question[]> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    You are an expert English teacher for Korean middle school students (3rd year).
    Generate ${count} multiple-choice grammar questions specifically about the "Present Perfect" tense (현재완료).
    
    Focus on the specific usage type: ${usageType}. If usage type is 'Mixed', include a mix of Experience, Continuation, Completion, and Result.
    
    The questions should test:
    1. Correct form (have/has + p.p.)
    2. Distinguishing between usage types (e.g., determining if a sentence is 'experience' or 'result')
    3. Common mistakes Korean students make.
    
    Provide the output strictly in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING, description: "The question sentence, often with a blank." },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "4 multiple choice options."
            },
            correctAnswer: { type: Type.STRING, description: "The exact string of the correct option." },
            explanation: { type: Type.STRING, description: "Explanation in Korean why the answer is correct." },
            usageType: { type: Type.STRING, description: "One of: 경험, 계속, 완료, 결과" },
            koreanTranslation: { type: Type.STRING, description: "Korean translation of the question sentence." }
          },
          required: ["id", "text", "options", "correctAnswer", "explanation", "usageType", "koreanTranslation"]
        }
      }
    }
  });

  const jsonText = response.text;
  if (!jsonText) {
    throw new Error("Empty response from Gemini");
  }

  try {
    const questions = JSON.parse(jsonText) as Question[];
    return questions;
  } catch (error) {
    console.error("Failed to parse JSON", error);
    throw new Error("Failed to parse generated questions.");
  }
};