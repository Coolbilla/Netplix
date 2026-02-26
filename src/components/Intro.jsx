import React, { useState, useEffect } from 'react';
import { Cpu, Signal } from 'lucide-react';

const Intro = ({ onComplete }) => {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const timers = [
            setTimeout(() => setPhase(1), 100),
            setTimeout(() => setPhase(2), 800),
            setTimeout(() => setPhase(3), 3500),
            setTimeout(() => onComplete(), 4500)
        ];
        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[999] bg-[#020617] flex flex-col items-center justify-center transition-all duration-1000 ease-in-out overflow-hidden ${phase === 3 ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-[3000ms] ease-out ${phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                <div className="absolute w-[80vw] h-[40vh] bg-neon-cyan/10 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute w-[40vw] h-[20vh] bg-blue-600/20 blur-[100px] rounded-full pointer-events-none" />
            </div>

            <div className={`absolute top-12 flex items-center gap-3 transition-all duration-[1500ms] delay-500 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
                <Signal className="text-neon-cyan animate-pulse" size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-500">Encrypted Uplink</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <h1 className={`text-6xl md:text-8xl lg:text-[9rem] font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white via-[#e0ffff] to-[#00ffff] transition-all duration-[2500ms] cubic-bezier(0.16, 1, 0.3, 1) ${phase >= 2 ? 'opacity-100 tracking-tighter md:tracking-[0.05em] drop-shadow-[0_0_50px_rgba(0,255,255,0.4)]' : 'opacity-0 tracking-[0.5em] blur-md'}`}>
                    NETPLIX
                </h1>

                <div className={`mt-12 flex flex-col items-center transition-all duration-1000 delay-[1000ms] ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="relative h-[2px] w-64 md:w-96 bg-white/5 rounded-full overflow-hidden mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-cyan to-transparent w-[200%] animate-scan" />
                    </div>
                    <div className="flex items-center gap-2 text-neon-cyan">
                        <Cpu size={12} className="animate-spin-slow" />
                        <span className="text-[9px] font-black uppercase tracking-[0.4em] animate-pulse">Initializing Global Matrix</span>
                    </div>
                </div>
            </div>

            {/* FIXED: Standard style tag to remove console error */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(50%); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-scan { animation: scan 2s ease-in-out infinite; }
                .animate-spin-slow { animation: spin 3s linear infinite; }
            `}} />
        </div>
    );
};

export default Intro;