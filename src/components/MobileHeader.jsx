import React from 'react';
import { Search, Sparkles } from 'lucide-react';

const MobileHeader = ({ user, setCurrentPage, onSearchClick, onVibeSearch }) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-[100] px-5 py-4 flex items-center justify-between bg-[#020617]/70 backdrop-blur-2xl border-b border-white/5 transition-all">

            {/* LEFT: Clean Brand Logo */}
            <div
                className="flex items-center cursor-pointer active:scale-95 transition-transform"
                onClick={() => { setCurrentPage('Home'); window.scrollTo(0, 0); }}
            >
                <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white drop-shadow-md">
                    Net<span className="text-neon-cyan">plix</span>
                </h1>
            </div>

            {/* RIGHT: Actions & Profile */}
            <div className="flex items-center gap-4">

                {/* Vibe Search */}
                <button onClick={onVibeSearch} className="text-neon-cyan active:scale-90 transition-transform p-1 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">
                    <Sparkles size={20} />
                </button>

                {/* Normal Search */}
                <button onClick={onSearchClick} className="text-zinc-300 active:scale-90 transition-transform p-1">
                    <Search size={20} />
                </button>

                {/* Profile Identity Link - NOW DIRECTLY CONNECTED */}
                <button
                    onClick={() => { setCurrentPage('Profile'); window.scrollTo(0, 0); }}
                    className="w-8 h-8 rounded-full border-2 border-white/10 p-0.5 overflow-hidden active:scale-90 transition-all ml-1 bg-[#0a0a0a]"
                >
                    <img
                        src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Ishaan"}
                        className="w-full h-full object-cover rounded-full"
                        alt="Profile"
                    />
                </button>
            </div>
        </header>
    );
};

export default MobileHeader;