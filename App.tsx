
import React, { useState, useEffect, useCallback } from 'react';
import { ConversionMode, HistoryItem } from './types';
import { convertText } from './services/geminiService';

// Helper components
const NavItem: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-all rounded-lg ${
      active 
        ? 'bg-indigo-600 text-white shadow-md' 
        : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<ConversionMode>('T2S');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copyStatus, setCopyStatus] = useState<{id: string, text: string} | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hanziflow_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hanziflow_history', JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const handleConvert = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const result = await convertText(inputText, mode);
      setOutputText(result.text);
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        originalText: inputText.substring(0, 100),
        convertedText: result.text.substring(0, 100),
        mode,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (err) {
      alert(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopyStatus({ id, text: '已複製' });
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const clearAll = () => {
    setInputText('');
    setOutputText('');
  };

  const swapText = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
    if (mode === 'T2S') setMode('S2T');
    else if (mode === 'S2T') setMode('T2S');
  };

  const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight serif">HanziFlow</h1>
          </div>
          <div className="hidden md:flex gap-1">
            <NavItem active={mode === 'T2S'} onClick={() => setMode('T2S')}>繁轉簡</NavItem>
            <NavItem active={mode === 'S2T'} onClick={() => setMode('S2T')}>簡轉繁</NavItem>
            <NavItem active={mode === 'SMART_TW'} onClick={() => setMode('SMART_TW')}>台灣常用</NavItem>
            <NavItem active={mode === 'SMART_HK'} onClick={() => setMode('SMART_HK')}>香港常用</NavItem>
            <NavItem active={mode === 'SMART_CN'} onClick={() => setMode('SMART_CN')}>大陸常用</NavItem>
          </div>
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors border border-indigo-100"
          >
            {showGuide ? '返回轉換' : '部署指南'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {!showGuide ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
              {/* Input Area */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-700">原文內容</label>
                  <div className="flex gap-3">
                    {inputText && (
                      <button 
                        onClick={() => handleCopy(inputText, 'input')} 
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                      >
                        {copyStatus?.id === 'input' ? <CheckIcon /> : <CopyIcon />}
                        {copyStatus?.id === 'input' ? '已複製' : '複製原文'}
                      </button>
                    )}
                    <button onClick={clearAll} className="text-xs text-slate-400 hover:text-rose-500 transition-colors">清空原文</button>
                  </div>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="在此輸入或粘貼要轉換的內容..."
                  className="w-full h-full min-h-[350px] p-6 text-lg border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all resize-none bg-white font-light text-slate-800 leading-relaxed"
                />
              </div>

              {/* Desktop Control Buttons */}
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex-col gap-4">
                <button 
                    onClick={handleConvert}
                    disabled={loading || !inputText.trim()}
                    className="bg-indigo-600 text-white p-5 rounded-full shadow-2xl hover:bg-indigo-700 transform hover:scale-110 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {loading ? (
                    <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  )}
                </button>
                <button 
                    onClick={swapText}
                    title="置換原文與結果"
                    className="bg-white text-slate-500 p-3 rounded-full shadow-lg hover:bg-slate-50 border border-slate-100 transition-all active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                </button>
              </div>

              {/* Output Area */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-slate-700">轉換結果</label>
                  {outputText && (
                    <button 
                      onClick={() => handleCopy(outputText, 'output')} 
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full transition-all"
                    >
                      {copyStatus?.id === 'output' ? <CheckIcon /> : <CopyIcon />}
                      {copyStatus?.id === 'output' ? '已複製' : '複製結果'}
                    </button>
                  )}
                </div>
                <div className="relative flex-1">
                  <textarea
                    readOnly
                    value={outputText}
                    placeholder="轉換後的文字將顯示在此..."
                    className="w-full h-full min-h-[350px] p-6 text-lg border border-slate-200 rounded-2xl shadow-sm bg-slate-50 font-light text-slate-800 leading-relaxed outline-none resize-none"
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                      <div className="flex flex-col items-center gap-4">
                          <div className="w-14 h-14 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                          <p className="text-sm font-semibold text-indigo-700">正在精準轉換中...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <section className="mt-20">
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 serif">近期紀錄</h2>
                  <button 
                    onClick={() => { if(confirm('確定清除紀錄？')){setHistory([]);} }}
                    className="text-sm font-medium text-slate-400 hover:text-rose-500"
                  >
                    清除紀錄
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {history.map((item) => (
                    <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                            {item.mode === 'T2S' ? '繁 → 簡' : item.mode === 'S2T' ? '簡 → 繁' : '智能適配'}
                          </span>
                        </div>
                        <div className="flex gap-4 mb-4">
                          <p className="text-sm text-slate-500 truncate italic flex-1">"{item.originalText}"</p>
                          <p className="text-sm text-slate-800 font-medium truncate flex-1">→ {item.convertedText}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setInputText(item.originalText)} className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg">回填</button>
                          <button onClick={() => handleCopy(item.convertedText, item.id)} className="flex-1 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg">
                             {copyStatus?.id === item.id ? '已複製' : '複製結果'}
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Deployment Guide Section */
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-indigo-600 p-8 text-white">
                <h2 className="text-3xl font-bold serif mb-2">虛擬主機部署指南</h2>
                <p className="opacity-80">將 HanziFlow 快速部署到您的伺服器環境中。</p>
             </div>
             <div className="p-8 space-y-8 text-slate-600">
                <section>
                   <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">1</span>
                      準備檔案
                   </h3>
                   <p className="mb-4">本應用程式採用現代的 <strong>ESM (ES Modules)</strong> 架構，不需編譯即可在現代瀏覽器運行。您需要將以下檔案上傳至主機的 <code>public_html</code> 或網站根目錄：</p>
                   <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><code>index.html</code> (入口文件)</li>
                      <li><code>App.tsx</code> / <code>index.tsx</code> (核心邏輯)</li>
                      <li><code>services/geminiService.ts</code> (API 服務)</li>
                   </ul>
                </section>

                <section>
                   <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">2</span>
                      配置 API Key
                   </h3>
                   <p className="mb-4">虛擬主機通常不直接支援 <code>process.env</code>。在簡單的託管環境中，您需要：</p>
                   <div className="bg-slate-900 rounded-xl p-5 font-mono text-sm text-slate-300 overflow-x-auto">
                      <p className="text-indigo-400">// 在 services/geminiService.ts 中</p>
                      <p>const ai = new GoogleGenAI({`{ apiKey: '您的_API_KEY_字串' }`});</p>
                   </div>
                   <p className="mt-4 text-sm text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      注意：前端暴露 API Key 有被濫用的風險。生產環境建議使用後端 Proxy (如 Vercel Functions 或 Node.js 中間層) 來保護您的 Key。
                   </p>
                </section>

                <section>
                   <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">3</span>
                      伺服器設定 (cPanel/Apache)
                   </h3>
                   <p className="mb-4">如果您使用的是 Apache 主機，建議新增 <code>.htaccess</code> 以支援正確的 MIME 類型：</p>
                   <div className="bg-slate-900 rounded-xl p-5 font-mono text-sm text-slate-300 overflow-x-auto">
                      <p>AddType application/javascript .ts</p>
                      <p>AddType application/javascript .tsx</p>
                   </div>
                </section>

                <div className="pt-6 border-t border-slate-100 flex justify-center">
                   <button 
                     onClick={() => setShowGuide(false)}
                     className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all"
                   >
                     返回使用
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-white font-bold serif text-xl block mb-4 tracking-tight italic">HanziFlow AI</span>
          <p className="text-sm max-w-lg mx-auto mb-10 text-slate-500">
            結合 Gemini 3 技術，提供上下文感知的簡繁轉換。無論是個人使用還是企業部署，HanziFlow 都是您的最佳夥伴。
          </p>
          <div className="border-t border-slate-800 pt-10 text-[10px] tracking-widest uppercase font-bold">
            <p>© 2025 HanziFlow AI. 支援靜態託管與虛擬主機部署。</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
