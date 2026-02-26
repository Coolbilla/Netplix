import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Users, Play, Plus, Search, Radio, Zap, Sparkles } from 'lucide-react';
import CreatePartyModal from '../components/Party/CreatePartyModal';
import { createParty } from '../services/partyService';

const PartyLobby = ({ user, onJoinParty, preselectedMedia, clearPreselectedMedia }) => {
    const [parties, setParties] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        if (preselectedMedia) {
            setIsModalOpen(true);
        }
    }, [preselectedMedia]);

    const handleCreateParty = async (isPublic) => {
        try {
            const mediaToUse = preselectedMedia;
            if (!mediaToUse) {
                // If manual initiate and we need a movie picker, that's a future feature.
                // For now, we assume it comes from the Watch Party button.
                return;
            }
            const partyId = await createParty(user, mediaToUse, isPublic);
            onJoinParty(partyId);
            setIsModalOpen(false);
            if (clearPreselectedMedia) clearPreselectedMedia();
        } catch (error) {
            console.error("Failed to initiate hub:", error);
        }
    };

    useEffect(() => {
        const q = query(
            collection(db, "parties"),
            where("settings.isPublic", "==", true),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const activeParties = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setParties(activeParties);
        });

        return () => unsub();
    }, []);

    const filteredParties = parties.filter(p =>
        p.media.title.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">

            {/* Atmospheric Depth Orbs */}
            <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none z-0" />

            {/* 1. Header Protocol HUD */}
            <header className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-neon-cyan" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
                            Social Stream Protocol
                        </h3>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                        Live <span className="text-neon-cyan">Parties</span>
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Holographic Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-neon-cyan transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Locate Frequencies..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-white/[0.02] border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm text-white outline-none focus:border-neon-cyan/40 focus:bg-white/[0.05] transition-all w-full sm:w-64 shadow-2xl"
                        />
                    </div>

                    {/* Create Room Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neon-purple text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-neon-purple hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} strokeWidth={3} /> Initiate Hub
                    </button>
                </div>
            </header>

            {/* 2. Parties Grid - High Tech Modules */}
            <div className="relative z-10">
                {filteredParties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredParties.map((party) => (
                            <div
                                key={party.id}
                                className="glass-panel group relative rounded-[2rem] overflow-hidden border border-white/5 hover:border-neon-cyan/40 transition-all duration-700 shadow-2xl"
                            >
                                {/* Media Backdrop */}
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${party.media.poster}`}
                                        className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent" />

                                    {/* Live Badge HUD */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-neon">
                                        <div className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse shadow-neon" />
                                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Frequency Active</span>
                                    </div>

                                    {/* Member HUD */}
                                    <div className="absolute top-4 right-4 flex items-center gap-2 glass-panel px-3 py-1.5 rounded-xl border-white/10">
                                        <Users size={12} className="text-neon-purple" />
                                        <span className="text-[10px] font-black text-white">{party.members?.length || 0}</span>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className="p-6">
                                    <h4 className="text-white font-black italic uppercase tracking-tight text-lg truncate mb-1">
                                        {party.media.title}
                                    </h4>

                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-5 h-5 rounded-full border border-neon-cyan/50 p-0.5">
                                            <img src={party.hostPhoto} className="w-full h-full rounded-full object-cover" alt="" />
                                        </div>
                                        <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest truncate">
                                            Established by <span className="text-zinc-300">{party.hostName}</span>
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => onJoinParty(party.id)}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-black py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-neon-cyan transition-all group-hover:shadow-neon transform active:scale-95"
                                    >
                                        <Zap size={14} fill="currentColor" /> Enter Frequency
                                    </button>
                                </div>

                                {/* Inner Shimmer Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 3. Empty State HUD */
                    <div className="flex flex-col items-center justify-center py-40 glass-panel border-dashed border-white/10 rounded-[3rem] bg-white/[0.01]">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-neon-purple/20 blur-2xl rounded-full" />
                            <Radio size={56} className="text-zinc-800 relative z-10" />
                        </div>
                        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-xs text-center leading-relaxed">
                            No active signals detected.<br />
                            <span className="text-zinc-700 italic lowercase font-light">Initiate a hub to begin broadcast.</span>
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Integration */}
            {isModalOpen && (
                <CreatePartyModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        if (clearPreselectedMedia) clearPreselectedMedia();
                    }}
                    onCreate={handleCreateParty}
                    media={preselectedMedia}
                />
            )}
        </div>
    );
};

export default PartyLobby;