import React, { useState, useEffect } from 'react';
import { User, LogIn, Clock } from 'lucide-react';

const TVHeader = ({ user, onLogin }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <header className="absolute top-0 right-0 w-full px-20 py-10 flex justify-between items-center z-[100] bg-transparent pointer-events-none">
            {/* 1. APP LOGO & BRANDING */}
            <div className="flex items-center gap-6 pointer-events-auto">
                <div className="relative group">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                        NET<span className="text-neon-cyan">PLAYER</span>
                    </h1>
                    <div className="absolute -bottom-2 left-0 w-0 h-1 bg-neon-cyan transition-all duration-500 group-hover:w-full shadow-neon" />
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-neon" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">TV Sandbox 2.0</span>
                </div>
            </div>

            {/* 2. REAL-TIME CLOCK & USER STATUS */}
            <div className="flex items-center gap-10 pointer-events-auto">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-3 text-white font-black text-3xl tabular-nums italic tracking-tighter drop-shadow-lg">
                        <Clock className="text-neon-cyan" size={24} />
                        {formatTime(time)}
                    </div>
                </div>

                <div className="h-10 w-[1px] bg-white/10" />

                {user ? (
                    <div className="flex items-center gap-5 focus:outline-none group">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-neon-cyan transition-colors">
                                {user.displayName || 'Watcher Node'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                Global Rank: Elite
                            </span>
                        </div>
                        <div className="w-14 h-14 rounded-2xl border-2 border-white/20 overflow-hidden bg-zinc-900 group-hover:border-neon-cyan focus:border-neon-cyan transition-all group-hover:scale-110 shadow-2xl">
                            <img
                                src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ishaan'}
                                className="w-full h-full object-cover"
                                alt="Profile"
                            />
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onLogin}
                        tabIndex="0"
                        className="flex items-center gap-4 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-110 focus:scale-110 focus:bg-neon-cyan transition-all shadow-2xl outline-none"
                    >
                        <LogIn size={24} />
                        Auth Login
                    </button>
                )}
            </div>
        </header>
    );
};

export default TVHeader;
