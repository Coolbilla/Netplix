import React, { useState } from 'react';
import { X, Globe, Lock, Users, Zap, ShieldCheck } from 'lucide-react';

const CreatePartyModal = ({ isOpen, onClose, onCreate, media }) => {
    const [isPublic, setIsPublic] = useState(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[600] bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-300">

            {/* Background Atmosphere */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="glass-panel w-full max-w-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] relative z-10">
                {/* HUD Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-8 bg-neon-cyan" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">
                            Initiate Hub
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Media HUD Section */}
                    <div className="flex gap-5 items-center glass-panel !bg-white/[0.03] p-4 rounded-2xl border-white/5">
                        <div className="relative w-16 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10">
                            <img
                                src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w200${media?.poster_path}`}
                                className="w-full h-full object-cover"
                                alt=""
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-black text-neon-cyan uppercase tracking-[0.2em] mb-1">Target Transmission</p>
                            <h4 className="font-black italic text-white leading-tight uppercase truncate tracking-tighter">
                                {media?.title || media?.name}
                            </h4>
                        </div>
                    </div>

                    {/* Privacy Selection Matrix */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setIsPublic(true)}
                            className={`w-full p-5 rounded-[1.5rem] border-2 flex items-center gap-5 transition-all duration-500 ${isPublic
                                ? 'bg-neon-cyan/10 border-neon-cyan shadow-neon'
                                : 'bg-white/[0.02] border-transparent opacity-40 hover:opacity-80'
                                }`}
                        >
                            <div className={`p-3 rounded-xl ${isPublic ? 'bg-neon-cyan text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                <Globe size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-white uppercase italic tracking-wider">Public Protocol</p>
                                <p className="text-[9px] text-zinc-500 uppercase font-bold">Visible to everyone in global lobby</p>
                            </div>
                        </button>

                        <button
                            onClick={() => setIsPublic(false)}
                            className={`w-full p-5 rounded-[1.5rem] border-2 flex items-center gap-5 transition-all duration-500 ${!isPublic
                                ? 'bg-neon-purple/10 border-neon-purple shadow-neon-purple'
                                : 'bg-white/[0.02] border-transparent opacity-40 hover:opacity-80'
                                }`}
                        >
                            <div className={`p-3 rounded-xl ${!isPublic ? 'bg-neon-purple text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                <Lock size={20} />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-black text-white uppercase italic tracking-wider">Private Frequency</p>
                                <p className="text-[9px] text-zinc-500 uppercase font-bold">Invite only via direct terminal link</p>
                            </div>
                        </button>
                    </div>

                    {/* Action Trigger */}
                    <button
                        onClick={() => onCreate(isPublic)}
                        className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-neon-cyan transition-all transform active:scale-95 shadow-2xl flex items-center justify-center gap-3 group"
                    >
                        <Zap size={16} fill="black" className="group-hover:animate-pulse" />
                        Establish Frequency
                    </button>
                </div>

                {/* Inner Shimmer Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
            </div>
        </div>
    );
};

export default CreatePartyModal;