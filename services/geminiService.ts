
import { GoogleGenAI, Modality } from "@google/genai";
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
        temperature: 0.2,
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

export const textToSpeech = async (text: string): Promise<string> => {
  if (!text.trim()) return "";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this text clearly in Chinese: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Neutral high-quality voice
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("未能生成語音數據");
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    throw new Error("語音合成失敗，請稍後再試。");
  }
};
