import { GoogleGenAI, Type } from "@google/genai";
import { Question, UsageType } from "../types";

export const generateQuestions = async (count: number, usageType: UsageType): Promise<Question[]> => {
  let apiKey = '';

  // 1. Try various environment variable patterns (Standard Node, Next.js, CRA)
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.API_KEY) apiKey = process.env.API_KEY;
      else if (process.env.NEXT_PUBLIC_API_KEY) apiKey = process.env.NEXT_PUBLIC_API_KEY;
      else if (process.env.REACT_APP_API_KEY) apiKey = process.env.REACT_APP_API_KEY;
    }
  } catch (e) {
    // Ignore process access errors
  }

  // 2. Try Vite environment variables
  if (!apiKey) {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        // @ts-ignore
        if (import.meta.env.VITE_API_KEY) apiKey = import.meta.env.VITE_API_KEY;
        // @ts-ignore
        else if (import.meta.env.API_KEY) apiKey = import.meta.env.API_KEY;
      }
    } catch (e) {
      // Ignore import.meta access errors
    }
  }

  // 3. Try URL Query Parameters (Fallback for quick testing without rebuilds)
  if (!apiKey && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    apiKey = params.get('key') || params.get('apiKey') || '';
  }

  if (!apiKey) {
    throw new Error(
      "API Key를 찾을 수 없습니다.\n\n" +
      "Vercel 배포 시 환경 변수 설정이 필요합니다.\n" +
      "Settings > Environment Variables에서 다음 변수명 중 하나로 API 키를 추가해주세요:\n" +
      "- VITE_API_KEY (Vite 권장)\n" +
      "- NEXT_PUBLIC_API_KEY\n" +
      "- REACT_APP_API_KEY\n" +
      "- API_KEY\n\n" +
      "⚠️ 변수 추가 후에는 반드시 'Redeploy'를 해야 적용됩니다.\n" +
      "임시 해결책: 브라우저 주소 뒤에 '?key=AIza...' 형식으로 키를 붙여 접속하세요."
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