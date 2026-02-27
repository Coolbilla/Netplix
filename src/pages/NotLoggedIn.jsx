import React from 'react';
import { Lock, Unlock, Check, AlertCircle, ChevronLeft, Crown, X } from 'lucide-react';

const NotLoggedIn = ({ onLogin, setCurrentPage }) => {
    return (
        <div className="w-full min-h-screen flex flex-col items-center bg-[#020617] pt-32 pb-20 px-6 animate-in fade-in duration-700 relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.08)_0%,transparent_50%)] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto flex flex-col items-center gap-12 w-full z-10">
                
                {/* Back Button */}
                <div className="w-full flex justify-start">
                    <button 
                        onClick={() => setCurrentPage('Home')}
                        className="flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-all group cursor-pointer"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Return to Nexus</span>
                    </button>
                </div>

                {/* Login Card */}
                <div className="glass-panel p-10 md:p-16 rounded-[3rem] border border-white/5 text-center w-full max-w-2xl relative overflow-hidden bg-white/[0.02] backdrop-blur-xl shadow-2xl">
                    {/* Decorative Scanner Line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan" />
                    
                    <div className="absolute -top-10 -right-10 p-8 opacity-[0.03] -rotate-12 select-none">
                        <Unlock size={240} />
                    </div>

                    <div className="w-24 h-24 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.2)] relative">
                        <Lock className="text-cyan-400" size={40} />
                        <div className="absolute inset-0 rounded-3xl animate-pulse bg-cyan-500/5" />
                    </div>

                    <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">
                        Neural Link <span className="text-cyan-500">Offline</span>
                    </h2>
                    <p className="text-zinc-400 text-sm md:text-base mb-10 leading-relaxed uppercase tracking-[0.15em] font-medium max-w-md mx-auto">
                        Authentication required to access <span className="text-white">encrypted data streams</span> and personal archives.
                    </p>
                    
                    <button
                        onClick={onLogin}
                        className="w-full max-w-sm bg-white text-black font-black py-5 rounded-2xl hover:bg-cyan-400 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)] text-xs tracking-[0.4em] cursor-pointer group"
                    >
                        <span className="group-hover:tracking-[0.5em] transition-all">ESTABLISH CONNECTION</span>
                    </button>
                </div>

                {/* Comparison Chart */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Benefits */}
                    <div className="group glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:bg-cyan-500/[0.02] transition-colors">
                        <h3 className="flex items-center gap-3 text-cyan-400 font-black uppercase tracking-widest text-xs mb-8">
                            <Crown size={16} className="animate-pulse" /> Authorized Access
                        </h3>
                        <ul className="space-y-5 text-left">
                            {[
                                "Sync cross-platform 'My List'",
                                "Persistence: Resume playback status",
                                "Host encrypted Watch Parties",
                                "Custom profile & Bottts DNA",
                                "Neural tailored recommendations"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-3 text-zinc-300 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                                    <div className="mt-0.5 p-0.5 bg-cyan-500/20 rounded text-cyan-400 flex-shrink-0">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Guest Limitations */}
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] opacity-70 hover:opacity-100 transition-opacity">
                        <h3 className="flex items-center gap-3 text-red-500 font-black uppercase tracking-widest text-xs mb-8">
                            <AlertCircle size={16} /> Guest Protocol
                        </h3>
                        <ul className="space-y-5 text-left">
                            {[
                                "Session history wipes on exit",
                                "No persistent data storage",
                                "Watch Party restricted (View Only)",
                                "Standard Guest identifier",
                                "Throttled search priority"
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-3 text-zinc-500 text-[11px] font-bold leading-relaxed uppercase tracking-wider">
                                    <div className="mt-0.5 p-0.5 bg-red-500/10 rounded text-red-500 flex-shrink-0">
                                        <X size={12} strokeWidth={3} />
                                    </div>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(500px); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default NotLoggedIn;
