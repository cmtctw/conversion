
import { GoogleGenAI } from "@google/genai";
import { ConversionMode, ConversionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_PROMPTS: Record<ConversionMode, string> = {
  T2S: "You are a professional translator. Convert the following Traditional Chinese text to Simplified Chinese. Maintain the original meaning perfectly. Do not add any conversational filler.",
  S2T: "You are a professional translator. Convert the following Simplified Chinese text to Traditional Chinese. Maintain the original meaning perfectly. Do not add any conversational filler.",
  SMART_TW: "You are a linguistic expert specialized in Taiwan's usage of Traditional Chinese. Convert the text and adapt vocabulary to Taiwan's local standards (e.g., use '軟體' instead of '軟件', '馬鈴薯' instead of '土豆').",
  SMART_HK: "You are a linguistic expert specialized in Hong Kong's usage of Traditional Chinese. Convert the text and adapt vocabulary to Hong Kong's local standards (e.g., use '巴士' instead of '公交車', '雪糕' instead of '冰淇淋').",
  SMART_CN: "You are a linguistic expert specialized in Mainland China's usage of Simplified Chinese. Convert the text and adapt vocabulary to China's local standards (e.g., use '软件' instead of '軟體', '土豆' instead of '馬鈴薯')."
};

export const convertText = async (
  text: string, 
  mode: ConversionMode
): Promise<ConversionResult> => {
  if (!text.trim()) return { text: "" };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction: SYSTEM_PROMPTS[mode],
        temperature: 0.2, // Lower temperature for more deterministic conversion
      },
    });

    return {
      text: response.text || "轉換失敗，請稍後再試。",
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("API 請求出錯，請檢查網絡或 API Key。");
  }
};
