
export type ConversionMode = 
  | 'T2S' 
  | 'S2T' 
  | 'SMART_TW' 
  | 'SMART_HK' 
  | 'SMART_CN';

export interface HistoryItem {
  id: string;
  originalText: string;
  convertedText: string;
  mode: ConversionMode;
  timestamp: number;
}

export interface ConversionResult {
  text: string;
  explanation?: string;
}
