import React from 'react';
import { Users, Play, Radio, Zap } from 'lucide-react';

const PartyCard = ({ party, onJoin }) => {
    return (
        <div className="group relative glass-panel rounded-[2rem] overflow-hidden border border-white/5 hover:border-neon-cyan/40 transition-all duration-700 flex flex-col h-full shadow-2xl">

            {/* 1. Media Backdrop with HUD Badges */}
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${party.media.backdrop}`}
                    className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000"
                    alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />

                {/* Live Status HUD */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-neon">
                    <div className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse shadow-neon" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Frequency Active</span>
                </div>

                {/* Quick Join Trigger */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                        onClick={() => onJoin(party.id)}
                        className="bg-white text-black p-4 rounded-full scale-75 group-hover:scale-100 transition-all duration-300 shadow-neon active:scale-90"
                    >
                        <Play fill="black" size={24} />
                    </button>
                </div>
            </div>

            {/* 2. System Info Section */}
            <div className="p-6 flex-1 flex flex-col relative">
                <h3 className="font-black italic text-lg mb-1 truncate text-white uppercase tracking-tighter">
                    {party.media.title}
                </h3>

                <div className="flex items-center gap-2 mb-6">
                    <div className="w-5 h-5 rounded-full border border-neon-cyan/50 p-0.5 overflow-hidden">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-[8px] font-black text-white">
                            {party.hostName?.charAt(0)}
                        </div>
                    </div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest truncate">
                        Established by <span className="text-zinc-300">{party.hostName?.split(' ')[0]}</span>
                    </p>
                </div>

                {/* 3. Member HUD & Action */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {[...Array(Math.min(party.members?.length || 1, 3))].map((_, i) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-[#020617] bg-zinc-900 flex items-center justify-center overflow-hidden">
                                    <Users size={10} className="text-neon-purple" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                            {party.members?.length || 0} Connected
                        </span>
                    </div>

                    <button
                        onClick={() => onJoin(party.id)}
                        className="flex items-center gap-1.5 text-[9px] font-black uppercase text-neon-cyan hover:text-white tracking-[0.2em] transition-all group-hover:translate-x-1"
                    >
                        <Zap size={10} fill="currentColor" /> Enter
                    </button>
                </div>

                {/* Atmospheric Glow Piece */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-neon-cyan/5 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Glass Shine Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
        </div>
    );
};

export default PartyCard;