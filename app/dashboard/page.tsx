'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/');
    else setIsLoading(false);
  }, [router]);

  const handleScan = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !jdText) {
      setError("Please provide both a resume and a job description.");
      return;
    }
    setIsScanning(true);
    setError(""); // Clear old errors
    const formData = new FormData();
    formData.append("resume_file", file);
    formData.append("jd_text", jdText);
    formData.append("mode", "gemini"); 

    try {
      const response = await fetch("https://ilmora-resume-api.onrender.com/api/v1/analyze", {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      
      const data = await response.json();

      if (response.ok) {
        if (data.gemini && data.gemini.error) {
          const errText = data.gemini.error.toLowerCase();
          if (errText.includes("503") || errText.includes("unavailable") || errText.includes("demand") || errText.includes("quota")) {
            setError("Neural network is currently at maximum capacity. Please wait 30 seconds and try again.");
          } else {
            setError(`Analysis Error: ${data.gemini.error}`);
          }
          setScanResult(null); 
        } else {
          setScanResult(data);
        }
      } else {
        // Fallback for actual HTTP server errors (400, 403, 500, etc.)
        // FIX: Extract raw error string WITHOUT lowercasing it first so we can catch "PAYWALL_TRIGGER"
        const rawError = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail || "");
        
        if (rawError.includes("PAYWALL_TRIGGER")) {
          setShowPaywall(true);
          setError(""); 
        }
        else if (response.status === 429 || response.status === 503 || rawError.toLowerCase().includes("busy") || rawError.toLowerCase().includes("quota")) {
          setError("Neural network rate limit exceeded. Please standby.");
        } else {
          setError(rawError || "System error during analysis.");
        }
      }
    } catch (err) {
      setError("Connection to neural link lost. Check your backend server.");
    } finally {
      setIsScanning(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-blue-400 font-mono italic">INITIALIZING SYSTEM...</div>;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 overflow-y-auto relative">
      
      {/* ========================================== */}
      {/* THE BETA WAITLIST MODAL */}
      {/* ========================================== */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0B1120] border border-blue-500/30 rounded-[2rem] p-8 max-w-md w-full shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] relative overflow-hidden">
            
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">✕</button>

            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <span className="text-white font-black text-xl">✦</span>
            </div>
            
            <h2 className="text-2xl font-black text-white mb-2"> Limit Reached</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You've used your 2 free scans for this month. ilmora is currently in closed beta. Join the waitlist to get early access when we launch the Pro version with unlimited scanning.
            </p>


            <button 
              onClick={() => {
                alert("You've been added to the early-access waitlist!");
                setShowPaywall(false);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              Join the Pro Waitlist
            </button>
          </div>
        </div>
      )}
      {/* ========================================== */}

      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto p-4 md:p-8 flex flex-col min-h-screen">
        
        {/* ILMORA PREMIUM HEADER */}
        <header className="flex justify-between items-center mb-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 px-6 py-4 rounded-2xl shadow-lg shadow-black/20 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              ilmora
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-3 bg-slate-950/50 px-5 py-2 rounded-full border border-slate-800/80 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <p className="text-[15px] font-medium text-slate-400 tracking-wide">
              Stop guessing. Start interviewing.
            </p>
          </div>

          <button 
            onClick={() => { localStorage.removeItem('token'); router.push('/'); }}
            className="group relative px-6 py-2.5 text-[10px] font-bold tracking-widest uppercase text-slate-300 transition-all overflow-hidden rounded-full border border-slate-700 bg-slate-950 hover:border-blue-500/50 hover:text-white"
          >
            <span className="relative z-10 flex items-center gap-2">
              Log Out
              <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-500/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>
        </header>

        {/* 12-COLUMN BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow pb-8">
          
          {/* BOX 1: INPUT STREAM */}
          <section className="lg:col-span-4 bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl flex flex-col h-[600px]">
            <h2 className="text-xs font-black mb-6 flex items-center gap-2 tracking-[0.2em] uppercase text-slate-400 border-b border-slate-800/50 pb-4 flex-shrink-0">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Resume and Job Description
            </h2>
            
            <form onSubmit={handleScan} className="flex flex-col flex-grow min-h-0 space-y-6">
              <div className="flex-shrink-0">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Your Resume (PDF)</label>
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 transition-all cursor-pointer bg-slate-950/50 rounded-xl border border-slate-800 p-1"
                />
              </div>

              <div className="flex-grow flex flex-col min-h-0">
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Target JD</label>
                <textarea 
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste job description here..."
                  className="w-full flex-grow bg-slate-950/50 rounded-xl border border-slate-800 p-4 text-xs focus:border-blue-500/50 outline-none resize-none custom-scrollbar"
                />
              </div>

              {error && <p className="text-rose-500 text-[10px] font-mono bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 flex-shrink-0">{error}</p>}

              <button 
                type="submit" 
                disabled={isScanning}
                className="w-full bg-blue-600 text-white font-black uppercase tracking-tighter py-4 rounded-xl transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-sm flex-shrink-0 relative overflow-hidden group"
              >
                <span className="relative z-10">{isScanning ? "Processing..." : "Execute Analysis"}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>
          </section>

          {/* BOX 2: MATCH SCORE */}
          <section className="lg:col-span-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col h-[600px] overflow-y-auto custom-scrollbar relative">
            <h3 className="text-xs font-black text-blue-400 mb-6 tracking-[0.2em] uppercase border-b border-slate-800/50 pb-4 flex-shrink-0">
              Diagnostic Match
            </h3>

            {isScanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-10 rounded-3xl">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="font-mono text-blue-400 animate-pulse uppercase tracking-widest text-[10px]">Analyzing...</p>
              </div>
            ) : !scanResult ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <div className="text-4xl mb-2 font-light italic">?</div>
                <div className="text-[10px] tracking-widest uppercase font-mono">Awaiting Input</div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500 flex flex-col h-full">
                <div className="flex flex-col items-center justify-center mb-8 pt-4">
                  <div className="text-8xl font-black text-white tracking-tighter drop-shadow-2xl">
                    {scanResult.gemini.match_score}<span className="text-blue-500 text-4xl">%</span>
                  </div>
                </div>

                <div className="p-5 bg-blue-600/5 border border-blue-500/20 rounded-xl mb-8 text-sm text-blue-100/80 leading-relaxed italic text-center mx-auto max-w-3xl">
                  "{scanResult.gemini.score_reason}"
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto pb-4">
                  <div className="bg-slate-950/30 p-5 rounded-2xl border border-slate-800/50">
                    <h4 className="text-[10px] font-black text-emerald-400 mb-4 tracking-[0.2em] uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Detected Expertise
                    </h4>
                    <ul className="space-y-3">
                      {scanResult.gemini.strong_points?.map((p: string, i: number) => (
                        <li key={i} className="text-xs text-slate-300 flex gap-3 leading-relaxed">
                          <span className="text-emerald-500 mt-0.5">▹</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-950/30 p-5 rounded-2xl border border-slate-800/50">
                    <h4 className="text-[10px] font-black text-rose-400 mb-4 tracking-[0.2em] uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Delta Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {scanResult.gemini.missing_keywords?.map((k: string, i: number) => (
                        <span key={i} className="px-2.5 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md text-[11px] font-mono shadow-sm">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* BOX 3: OPTIMIZATIONS & INTERVIEW */}
          <section className="lg:col-span-12 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 flex flex-col min-h-[400px] relative">
            <h3 className="text-xs font-black text-purple-400 mb-6 tracking-[0.2em] uppercase border-b border-slate-800/50 pb-4 flex-shrink-0">
               Feedback
            </h3>

            {isScanning ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm z-10 rounded-3xl">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <p className="font-mono text-purple-400 animate-pulse uppercase tracking-widest text-[10px]">Compiling Feedbacks...</p>
              </div>
            ) : !scanResult ? (
               <div className="h-full flex flex-col items-center justify-center opacity-30">
                 <div className="text-4xl mb-2 font-light italic">...</div>
                 <div className="text-[10px] tracking-widest uppercase font-mono">Standby</div>
               </div>
            ) : (
              <div className="animate-in fade-in duration-500 space-y-12">
                
                {/* Optimizations Section */}
                <div>
                  <h4 className="text-[10px] font-black text-emerald-400 mb-6 tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" /> Optimization Suggestions
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {scanResult.gemini.suggestions?.map((sugg: any, i: number) => (
                      <div key={i} className="flex flex-col border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50 hover:border-emerald-500/30 transition-all shadow-lg">
                        <div className="p-4 border-b border-slate-800/50 bg-rose-500/5">
                          <p className="text-xs text-slate-400 line-through opacity-70 leading-relaxed">{sugg.original}</p>
                        </div>
                        <div className="p-4 bg-emerald-500/5 relative flex-grow">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
                          <p className="text-xs text-slate-200 leading-relaxed">{sugg.improved}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interview Prep Section */}
                <div>
                  <h4 className="text-[10px] font-black text-purple-400 mb-6 tracking-[0.2em] uppercase flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" /> Interview Simulator
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scanResult.gemini.interview_questions?.map((q: string, i: number) => (
                      <div key={i} className="p-5 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-purple-500/30 hover:-translate-y-1 transition-all shadow-lg group">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-800/50 pb-3">
                          <div className="w-7 h-7 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold font-mono border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                            {i+1}
                          </div>
                          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold">Expected Question</span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}