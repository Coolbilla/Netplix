import React from 'react';
import { Lock, Unlock, Check, AlertCircle, ChevronLeft } from 'lucide-react';

const NotLoggedIn = ({ onLogin, setCurrentPage }) => {
    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-[#020617] pt-32 pb-20 px-6 animate-in fade-in duration-500 relative">
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 w-full z-10">
                
                {/* Back Button */}
                <div className="w-full flex justify-start">
                    <button 
                        onClick={() => setCurrentPage('Home')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-neon-cyan transition-colors group cursor-pointer"
                    >
                        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                    </button>
                </div>

                {/* Login Card */}
                <div className="glass-panel p-10 md:p-16 rounded-[3rem] border border-white/5 text-center w-full max-w-2xl relative overflow-hidden bg-white/[0.01]">
                    <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12"><Unlock size={120} /></div>
                    <div className="w-20 h-20 bg-neon-cyan/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-neon-cyan/20 shadow-neon">
                        <Lock className="text-neon-cyan" size={36} />
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-4">Neural Link Offline</h2>
                    <p className="text-zinc-500 text-sm md:text-base mb-10 leading-relaxed uppercase tracking-widest font-bold opacity-80">
                        Initialize connection to unlock your personal viewing archive.
                    </p>
                    
                    <button
                        onClick={onLogin}
                        className="w-full max-w-sm bg-white text-black font-black py-5 rounded-2xl hover:bg-neon-cyan transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-xs tracking-[0.3em] cursor-pointer"
                    >
                        ESTABLISH CONNECTION
                    </button>
                </div>

                {/* Comparison Chart */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-8 rounded-[2rem] border-neon-cyan/10 bg-neon-cyan/[0.01]">
                        <h3 className="flex items-center gap-3 text-neon-cyan font-black uppercase tracking-widest text-sm mb-6">
                            <Crown size={18} /> Account Benefits
                        </h3>
                        <ul className="space-y-4 text-left">
                            {["Save movies to 'My List'", "Resume exactly where you left off", "Host & Join global Watch Parties", "Custom profile & Bottts avatar", "Neural tailored recommendations"].map((text, i) => (
                                <li key={i} className="flex items-start gap-3 text-zinc-300 text-xs font-bold leading-relaxed">
                                    <div className="mt-1 p-0.5 bg-neon-cyan/20 rounded text-neon-cyan flex-shrink-0"><Check size={12} /></div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="glass-panel p-8 rounded-[2rem] border-red-500/10 bg-red-500/[0.01]">
                        <h3 className="flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-sm mb-6">
                            <AlertCircle size={18} /> Guest Limitations
                        </h3>
                        <ul className="space-y-4 text-left">
                            {["Viewing history resets on refresh", "No access to personal watchlist", "No Watch Party hosting privileges", "Generic guest identity", "Basic search priority"].map((text, i) => (
                                <li key={i} className="flex items-start gap-3 text-zinc-500 text-xs font-bold leading-relaxed">
                                    <div className="mt-1 p-0.5 bg-red-500/20 rounded text-red-500 flex-shrink-0"><X size={12} /></div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Simple Icon Imports for the above component to work
const Crown = ({ size, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;

export default NotLoggedIn;
