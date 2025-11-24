import { GoogleGenAI, Type } from "@google/genai";
import { Question, UsageType } from "../types";

export const generateQuestions = async (count: number, usageType: UsageType): Promise<Question[]> => {
  let apiKey = '';

  // 1. Try process.env (Standard Node/Webpack/CRA)
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      apiKey = process.env.API_KEY;
    }
  } catch (e) {}

  // 2. Try Vite environment variables (Common in Vercel/Vite deployments)
  if (!apiKey) {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
        // @ts-ignore
        apiKey = import.meta.env.VITE_API_KEY;
      }
    } catch (e) {}
  }

  // 3. Try URL Query Parameters (Fallback for quick testing without rebuilds)
  if (!apiKey && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    apiKey = params.get('key') || params.get('apiKey') || '';
  }

  if (!apiKey) {
    throw new Error(
      "API Key를 찾을 수 없습니다.\n\n" +
      "다음 중 하나의 방법으로 해결해주세요:\n" +
      "1. Vercel Settings > Environment Variables에 'API_KEY' (또는 'VITE_API_KEY')를 추가하고 재배포하세요.\n" +
      "2. 또는 브라우저 주소 뒤에 '?key=AIza...' 형식으로 API 키를 직접 붙여서 접속하세요."
    );
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });
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

  try {
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

    let jsonText = response.text;
    if (!jsonText) {
      throw new Error("Empty response from Gemini");
    }

    // Handle potential markdown code blocks more robustly
    jsonText = jsonText.trim();
    if (jsonText.startsWith("```")) {
      const match = jsonText.match(/```(?:json)?([\s\S]*?)```/);
      if (match) {
        jsonText = match[1];
      } else {
        jsonText = jsonText.replace(/^```(json)?/, "").replace(/```$/, "");
      }
    }

    const questions = JSON.parse(jsonText) as Question[];
    return questions;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Return a more user-friendly error message if it's an API failure
    if (error.message && (error.message.includes("API key") || error.message.includes("403"))) {
      throw new Error("API 키가 유효하지 않거나 권한이 없습니다. 키를 다시 확인해주세요.");
    }
    throw error;
  }
};