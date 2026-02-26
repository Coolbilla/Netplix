import React from 'react';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

const PartyControls = ({ isPlaying, onTogglePlay, isHost }) => {
    if (!isHost) return null; // Only the host sees these controls

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-black/60 backdrop-blur-xl px-8 py-3 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="text-zinc-400 hover:text-white transition-colors">
                <RotateCcw size={18} />
            </button>
            <button
                onClick={onTogglePlay}
                className="bg-white text-black p-3 rounded-full hover:scale-110 transition-transform active:scale-95 shadow-xl"
            >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button className="text-zinc-400 hover:text-white transition-colors">
                <FastForward size={18} />
            </button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Host Control</span>
        </div>
    );
};

export default PartyControls;