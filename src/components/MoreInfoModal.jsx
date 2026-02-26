import React, { useEffect, useState, useRef } from 'react';
import { neuralFetch, IMAGE_BASE } from '../utils/neuralFetch';
import {
    X, Play, Plus, ChevronDown, Check, Star,
    ShieldCheck, Calendar, Monitor, Users, Trophy
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';




const MoreInfoModal = ({ media, onClose, onPlay, onAddToList, user, onStartParty, toggleCompleted }) => {
    const [details, setDetails] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [activeSeason, setActiveSeason] = useState(1);
    const modalRef = useRef(null);

    // 1. Fetch High-Fidelity Metadata
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

    // 2. Fetch Episodes for the lower section
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">

            {/* BACKGROUND BLUR OVERLAY */}
            <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl" onClick={onClose} />

            {/* MAIN SCROLLABLE TERMINAL */}
            <div
                ref={modalRef}
                className="relative z-10 w-full max-w-7xl h-[92vh] bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 shadow-[0_0_120px_rgba(0,0,0,0.8)] overflow-y-auto no-scrollbar animate-in zoom-in"
            >

                {/* STICKY CLOSE BUTTON */}
                <button
                    onClick={onClose}
                    className="fixed top-12 right-20 z-[1100] glass-panel p-4 rounded-full hover:bg-white hover:text-black transition-all border-white/10 shadow-2xl active:scale-90"
                >
                    <X size={28} />
                </button>

                {/* --- FOLD 1: THE CINEMATIC STAGE --- */}
                <div className="min-h-[92vh] flex flex-col md:flex-row p-12 md:p-24 gap-20 shrink-0 items-center">

                    {/* LEFT ENGINE: INFO & ACTIONS */}
                    <div className="flex-1 space-y-10">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="bg-neon-cyan/20 text-neon-cyan text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-neon-cyan/30">
                                    Broadcast Integrity: High
                                </span>
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <Star size={16} fill="currentColor" />
                                    <span className="text-sm font-black tracking-widest">{details.vote_average?.toFixed(1)}</span>
                                </div>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
                                {details.title || details.name}
                            </h1>
                        </div>

                        <div className="flex items-center gap-10 text-zinc-500 text-[11px] font-black uppercase tracking-[0.4em]">
                            <span className="flex items-center gap-2"><Calendar size={16} /> {details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0]}</span>
                            <span className="flex items-center gap-2 text-neon-cyan"><ShieldCheck size={16} /> Ultra HD 4K</span>
                            <span className="opacity-40 italic">Dolby Atmos</span>
                        </div>

                        {/* DESCRIPTION GLASS BOX */}
                        <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-white/[0.03] shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]">
                            <p className="text-xl leading-relaxed text-zinc-300 italic font-medium opacity-90 tracking-tight">
                                {details.overview}
                            </p>
                        </div>

                        {/* ACTION PANEL */}
                        <div className="flex items-center gap-4 pt-4 flex-wrap">
                            <button
                                onClick={() => onPlay(details)}
                                className="bg-white text-black px-12 py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] hover:bg-neon-cyan transition-all transform active:scale-95 shadow-2xl flex items-center gap-3"
                            >
                                <Play fill="black" size={24} /> Initialize
                            </button>

                            <button
                                onClick={() => onStartParty && onStartParty(details)}
                                className="glass-panel text-white px-10 py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.5em] border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-400 transition-all flex items-center gap-3 shadow-2xl"
                            >
                                <Users size={24} className="text-green-400" /> Watch Party
                            </button>

                            <button
                                onClick={() => onAddToList(details)}
                                className={`w-20 h-20 shrink-0 rounded-[2rem] flex items-center justify-center transition-all border ${inWatchlist ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan shadow-neon' : 'glass-panel border-white/10 hover:border-white/40'}`}
                            >
                                {inWatchlist ? <Check size={32} /> : <Plus size={32} />}
                            </button>

                            <button
                                onClick={() => toggleCompleted && toggleCompleted(details)}
                                className={`w-20 h-20 shrink-0 rounded-[2rem] flex items-center justify-center transition-all border ${inVault ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'glass-panel border-white/10 hover:border-white/40'}`}
                            >
                                <Trophy size={32} />
                            </button>
                        </div>

                        {/* SCROLL HINT */}
                        <div className="flex items-center gap-4 opacity-20 animate-bounce pt-10">
                            <ChevronDown size={20} />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Scroll for Episode Logs</span>
                        </div>
                    </div>

                    {/* RIGHT ENGINE: 3D TILTED POSTER */}
                    <div className="hidden lg:flex flex-1 items-center justify-center perspective-[3000px]">
                        <div
                            className="relative w-[480px] aspect-[2/3] rounded-[3.5rem] overflow-hidden shadow-[50px_70px_120px_rgba(0,0,0,0.9)] border border-white/20 transition-all duration-1000 hover:rotate-y-0 hover:scale-105"
                            style={{
                                transform: 'rotateY(-28deg) rotateX(8deg) rotateZ(-2deg)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <img
                                src={`${IMAGE_BASE}/original${details.poster_path}`}
                                className="w-full h-full object-cover"
                                alt=""
                                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-zinc-800', 'flex', 'items-center', 'justify-center');
                    e.target.parentNode.innerHTML = '<span class="text-[10px] text-zinc-500">OFFLINE</span>';
                }}
                            />
                            {/* Inner Cyber Glow */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-neon-cyan/20 via-transparent to-white/5 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* --- FOLD 2: EPISODE HUB (Requires scrolling down) --- */}
                {details.media_type === 'tv' && (
                    <div className="px-24 py-24 bg-black/60 border-t border-white/5 backdrop-blur-3xl shrink-0">
                        <div className="flex items-center justify-between mb-16">
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white flex items-center gap-5">
                                    <Monitor size={36} className="text-neon-cyan" /> Episode Logs
                                </h3>
                                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em] ml-14">Transmission Phase: {activeSeason}</p>
                            </div>

                            {/* SEASON DROPDOWN */}
                            <div className="relative group">
                                <select
                                    value={activeSeason}
                                    onChange={(e) => setActiveSeason(Number(e.target.value))}
                                    className="appearance-none bg-white/5 border border-white/10 text-white pl-10 pr-20 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] outline-none focus:border-neon-cyan transition-all cursor-pointer hover:bg-white/10"
                                >
                                    {details.seasons?.filter(s => s.season_number > 0).map(s => (
                                        <option key={s.id} value={s.season_number} className="bg-[#0a0a0a]">{s.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-focus-within:rotate-180 transition-transform" size={20} />
                            </div>
                        </div>

                        {/* SIDEWAYS SCROLLER ENGINE */}
                        <div className="flex gap-10 overflow-x-auto no-scrollbar pb-10 -mx-10 px-10 snap-x">
                            {episodes.map((ep) => (
                                <div
                                    key={ep.id}
                                    onClick={() => onPlay({ ...details, season: activeSeason, episode: ep.episode_number })}
                                    className="min-w-[460px] group cursor-pointer snap-start"
                                >
                                    <div className="relative aspect-video rounded-[3rem] overflow-hidden border border-white/5 group-hover:border-neon-cyan/50 transition-all shadow-2xl mb-6 bg-zinc-900">
                                        <img
                                            src={`${IMAGE_BASE}/w500${ep.still_path}`}
                                            className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                            alt=""
                                            onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-zinc-800', 'flex', 'items-center', 'justify-center');
                    e.target.parentNode.innerHTML = '<span class="text-[10px] text-zinc-500">OFFLINE</span>';
                }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-20 transition-opacity" />

                                        {/* Play Hover Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-neon transform scale-50 group-hover:scale-100 transition-all duration-500">
                                                <Play fill="black" size={32} className="translate-x-1" />
                                            </div>
                                        </div>

                                        <div className="absolute bottom-8 left-10">
                                            <span className="text-[12px] font-black text-neon-cyan uppercase tracking-[0.2em] italic border-l-2 border-neon-cyan pl-3">
                                                EP {ep.episode_number}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-4 space-y-2">
                                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight group-hover:text-neon-cyan transition-colors truncate">
                                            {ep.name}
                                        </h4>
                                        <p className="text-[12px] text-zinc-500 line-clamp-2 italic font-medium leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                                            {ep.overview || "Manual override: metadata transmission restricted for this node."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoreInfoModal;