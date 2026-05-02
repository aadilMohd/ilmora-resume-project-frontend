'use client';

import { GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [status, setStatus] = useState<string>("System standby. Ready for auth.");
  const router = useRouter();

  // If they already have a wristband, send them straight to the command center
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setStatus("Authenticating with secure server...");
    
    try {
      const response = await fetch("https://ilmora-resume-api.onrender.com/api/v1/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setStatus(`Connection established. Welcome, ${data.user.name}`);
        router.push('/dashboard');
      } else {
        setStatus(`Auth Error: ${data.detail}`);
      }
    } catch (error) {
      setStatus("Connection failed. Backend offline.");
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col items-center justify-center overflow-hidden relative">
      
      {/* Deep Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse opacity-60" />
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        
        {/* The Premium Glass Card */}
        <div className="bg-[#0B1120]/80 backdrop-blur-2xl border border-slate-700/50 rounded-[2.5rem] p-10 md:p-12 flex flex-col items-center text-center shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)] relative overflow-hidden group">
          
          {/* Card Top Accent Glow */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/80 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-4 bg-blue-500/20 blur-2xl rounded-full" />

          {/* Logo Area */}
          <div className="mb-8 w-full flex flex-col items-center mt-2">
            <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-6 drop-shadow-lg">
              ilmora
            </h1>
            
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-950/60 border border-slate-800/80 shadow-inner">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Stop guessing. Start interviewing.
              </span>
            </div>
          </div>

          {/* Elegant Divider */}
          <div className="w-full flex items-center justify-center gap-4 mb-8 opacity-50">
            <div className="h-px w-full bg-gradient-to-r from-transparent to-slate-700" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500 whitespace-nowrap">Log In</span>
            <div className="h-px w-full bg-gradient-to-l from-transparent to-slate-700" />
          </div>

          {/* Login Action Area */}
          <div className="w-full flex flex-col items-center space-y-8">
            
            {/* Hover Wrapper for Google Button */}
            <div className="relative group/btn cursor-pointer">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-20 group-hover/btn:opacity-40 transition duration-500" />
              <div className="relative rounded-full shadow-2xl">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setStatus("Google OAuth Handshake Failed")}
                  useOneTap
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                />
              </div>
            </div>
            
            {/* Upgraded Terminal Status Output */}
            

          </div>
        </div>

        {/* Outer Footer */}
        <div className="mt-8 text-center flex flex-col gap-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600 font-mono">
          
          </p>
          <div className="flex justify-center gap-2 opacity-50">
            <span className="w-1 h-1 bg-slate-500 rounded-full" />
            <span className="w-1 h-1 bg-slate-500 rounded-full" />
            <span className="w-1 h-1 bg-slate-500 rounded-full" />
          </div>
        </div>

      </div>
    </main>
  );
}