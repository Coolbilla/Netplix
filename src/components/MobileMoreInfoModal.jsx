import React, { useEffect, useState } from 'react';
import { neuralFetch, IMAGE_BASE } from '../utils/neuralFetch';
import {
    X, Play, Plus, ChevronDown, Check, Star,
    ShieldCheck, Calendar, Monitor, Users, Trophy
} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';




const MobileMoreInfoModal = ({ media, onClose, onPlay, onAddToList, user, onStartParty, toggleCompleted }) => {
    const [details, setDetails] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [activeSeason, setActiveSeason] = useState(1);

    // Fetch High-Fidelity Metadata
    useEffect(() => {
        const fetchFullDetails = async () => {
            const type = media.media_type || (media.first_air_date ? 'tv' : 'movie');
            try {
                const { data } = await neuralFetch(
                    `/${type}/${media.id}?append_to_response=credits`
                );
                setDetails({ ...data, media_type: type });
            } catch (err) { console.error("Metadata Fetch Error:", err); }
        };
        fetchFullDetails();
    }, [media]);

    // Fetch Episodes
    useEffect(() => {
        if (details?.media_type === 'tv') {
            const fetchEpisodes = async () => {
                try {
                    const { data } = await neuralFetch(
                        `/tv/${media.id}/season/${activeSeason}`
                    );
                    setEpisodes(data.episodes || []);
                } catch (err) { console.error("Episode Fetch Error:", err); }
            };
            fetchEpisodes();
        }
    }, [details, activeSeason]);

    if (!details) return null;

    const inWatchlist = user?.watchlist?.some(item => item.id === details.id);
    const inVault = user?.completed?.some(item => item.id === details.id);

    return (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center animate-in fade-in duration-300">
            {/* BACKGROUND BLUR */}
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-md" onClick={onClose} />

            {/* SLIDE-UP BOTTOM SHEET */}
            <div className="relative z-10 w-full h-[90vh] bg-[#0a0a0a]/95 backdrop-blur-3xl rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.9)] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-full duration-500">

                {/* Drag Handle & Close Button */}
                <div className="sticky top-0 z-50 bg-gradient-to-b from-[#0a0a0a] to-transparent pb-4">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2" />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-6 glass-panel p-2.5 rounded-full hover:bg-white hover:text-black transition-all border-white/10 shadow-2xl active:scale-90 bg-black/60 backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 pb-12">
                    {/* Hero Image Backdrop */}
                    <div className="w-full aspect-video rounded-3xl overflow-hidden mb-6 relative border border-white/10 shadow-2xl">
                        <img
                            src={`${IMAGE_BASE}/w780${details.backdrop_path || details.poster_path}`}
                            className="w-full h-full object-cover"
                            alt=""
                            onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.classList.add('bg-zinc-800', 'flex', 'items-center', 'justify-center');
            e.target.parentNode.innerHTML = '<span class="text-[10px] text-zinc-500">OFFLINE</span>';
        }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-neon-cyan/20 text-neon-cyan text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-neon-cyan/30">
                            Broadcast Integrity
                        </span>
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star size={12} fill="currentColor" />
                            <span className="text-xs font-black tracking-widest">{details.vote_average?.toFixed(1)}</span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-[0.9] mb-4">
                        {details.title || details.name}
                    </h1>

                    <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-6">
                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0]}</span>
                        <span className="flex items-center gap-1.5 text-neon-cyan"><ShieldCheck size={12} /> Ultra HD 4K</span>
                    </div>

                    {/* Description */}
                    <div className="glass-panel p-5 rounded-2xl border-white/5 bg-white/[0.02] mb-6">
                        <p className="text-sm leading-relaxed text-zinc-300 italic font-medium opacity-90">
                            {details.overview}
                        </p>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-10">
                        <button
                            onClick={() => onPlay(details)}
                            className="col-span-2 bg-white text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 shadow-neon flex items-center justify-center gap-2"
                        >
                            <Play fill="black" size={18} /> Initialize Feed
                        </button>

                        <button
                            onClick={() => onStartParty && onStartParty(details)}
                            className="glass-panel text-green-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 active:bg-green-500/10 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Users size={16} /> Party
                        </button>

                        <button
                            onClick={() => onAddToList(details)}
                            className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border ${inWatchlist ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan' : 'glass-panel border-white/10 text-white'}`}
                        >
                            {inWatchlist ? <><Check size={16} /> Logged</> : <><Plus size={16} /> Add to list</>}
                        </button>

                        <button
                            onClick={() => toggleCompleted && toggleCompleted(details)}
                            className={`py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 border ${inVault ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'glass-panel border-white/10 text-white'}`}
                        >
                            <Trophy size={16} /> {inVault ? 'Watched' : 'Mark Watched'}
                        </button>
                    </div>

                    {/* Episodes Section */}
                    {details.media_type === 'tv' && (
                        <div className="border-t border-white/10 pt-8 -mx-6 px-6 bg-black/40">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
                                    <Monitor size={20} className="text-neon-cyan" /> Logs
                                </h3>
                                <div className="relative group w-32">
                                    <select
                                        value={activeSeason}
                                        onChange={(e) => setActiveSeason(Number(e.target.value))}
                                        className="w-full appearance-none bg-white/5 border border-white/10 text-white pl-4 pr-10 py-2 rounded-xl font-black text-[10px] uppercase outline-none"
                                    >
                                        {details.seasons?.filter(s => s.season_number > 0).map(s => (
                                            <option key={s.id} value={s.season_number} className="bg-[#0a0a0a]">S {s.season_number}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 -mx-6 px-6 snap-x">
                                {episodes.map((ep) => (
                                    <div key={ep.id} onClick={() => onPlay({ ...details, season: activeSeason, episode: ep.episode_number })} className="min-w-[240px] group cursor-pointer snap-start">
                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-xl mb-3 bg-zinc-900">
                                            <img
                                                src={`${IMAGE_BASE}/w500${ep.still_path}`}
                                                className="w-full h-full object-cover opacity-60"
                                                alt=""
                                                loading="lazy"
                                                onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.classList.add('bg-zinc-800', 'flex', 'items-center', 'justify-center');
            e.target.parentNode.innerHTML = '<span class="text-[10px] text-zinc-500">OFFLINE</span>';
        }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                                                    <Play fill="white" size={16} className="translate-x-0.5" />
                                                </div>
                                            </div>

                                            <div className="absolute bottom-3 left-3">
                                                <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest border-l-2 border-neon-cyan pl-2">
                                                    EP {ep.episode_number}
                                                </span>
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-black text-white uppercase italic truncate px-1">{ep.name}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileMoreInfoModal;