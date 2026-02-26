import React, { useEffect, useState, useRef } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import { Play, X, Plus, Check, Star, Calendar, ShieldCheck, Monitor, Trophy } from 'lucide-react';





const TVMoreInfo = ({ media, onClose, onPlay, user, onAddToList, onToggleVault }) => {
    const [details, setDetails] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [activeSeason, setActiveSeason] = useState(1);
    const playButtonRef = useRef(null);

    // 1. Fetch High-Fidelity Data
    useEffect(() => {
        if (!media) return;
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

    // 2. Fetch Episodes for TV Shows
    useEffect(() => {
        if (details?.media_type === 'tv') {
            const fetchEpisodes = async () => {
                try {
                    const { data } = await neuralFetch(
                        `/tv/${details.id}/season/${activeSeason}`
                    );
                    setEpisodes(data.episodes || []);
                } catch (err) { console.error("Episode Fetch Error:", err); }
            };
            fetchEpisodes();
        }
    }, [details, activeSeason]);

    // 3. Auto-Focus the Play Button on Mount (Crucial for TV Remotes)
    useEffect(() => {
        if (details && playButtonRef.current) {
            playButtonRef.current.focus();
        }
    }, [details]);

    // 4. Handle "Back" button on TV Remote
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Backspace') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!details) return null;

    const inWatchlist = user?.watchlist?.some(item => item.id === details.id);
    const inVault = user?.completed?.some(item => item.id === details.id);

    return (
        <div className="fixed inset-0 z-[2000] bg-[#050505] animate-in fade-in duration-500 overflow-hidden font-sans text-white">

            {/* --- MASSIVE BACKGROUND BACKDROP --- */}
            <div className="absolute inset-0 z-0">
                <img
                    src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${details.backdrop_path || details.poster_path}`}
                    className="w-full h-full object-cover opacity-50 transition-transform duration-[10000ms] ease-out scale-105"
                    alt=""
                />
                {/* Gradients to ensure text is perfectly readable */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/90 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </div>

            {/* --- MAIN CONTENT STAGE --- */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center px-24 max-w-[80vw]">

                {/* Metadata Badges */}
                <div className="flex items-center gap-6 mb-6 text-2xl font-black uppercase tracking-[0.3em] text-zinc-400">
                    <span className="flex items-center gap-3 text-neon-cyan">
                        <Star size={32} fill="currentColor" /> {details.vote_average?.toFixed(1)} Match
                    </span>
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-3">
                        <Calendar size={32} /> {(details.release_date || details.first_air_date)?.split('-')[0]}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-3 text-green-500 border-2 border-green-500/30 px-4 py-1 rounded-xl">
                        <ShieldCheck size={28} /> 4K HDR
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-[7rem] md:text-[8rem] font-black uppercase italic tracking-tighter leading-none mb-8 drop-shadow-2xl line-clamp-2">
                    {details.title || details.name}
                </h1>

                {/* Genres & Cast (TV Style) */}
                <div className="flex gap-10 text-2xl font-medium text-zinc-400 mb-10 italic">
                    <p><span className="text-white font-bold not-italic">Genres:</span> {details.genres?.map(g => g.name).join(', ')}</p>
                    <p className="line-clamp-1"><span className="text-white font-bold not-italic">Cast:</span> {details.credits?.cast?.slice(0, 3).map(c => c.name).join(', ')}</p>
                </div>

                {/* Overview */}
                <p className="text-4xl text-zinc-300 leading-relaxed italic max-w-5xl opacity-90 line-clamp-4 mb-16">
                    {details.overview}
                </p>

                {/* --- TV FOCUSABLE ACTION BUTTONS --- */}
                <div className="flex items-center gap-8">
                    <button
                        ref={playButtonRef}
                        tabIndex="0"
                        onClick={() => onPlay(details)}
                        className="bg-white text-black px-20 py-8 rounded-[3rem] font-black text-3xl uppercase tracking-widest outline-none focus:bg-neon-cyan focus:scale-110 focus:shadow-[0_0_60px_rgba(0,255,255,0.5)] transition-all flex items-center gap-4 group"
                    >
                        <Play fill="black" size={40} className="group-focus:animate-pulse" />
                        Initialize
                    </button>

                    <button
                        tabIndex="0"
                        onClick={() => onAddToList && onAddToList(details)}
                        className={`px-12 py-8 rounded-[3rem] font-black text-3xl uppercase tracking-widest outline-none transition-all flex items-center gap-4 border-4 
                            ${inWatchlist
                                ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan focus:bg-neon-cyan focus:text-black focus:scale-110'
                                : 'bg-black/50 backdrop-blur-xl border-white/20 text-white focus:border-neon-cyan focus:bg-white/10 focus:scale-110'
                            }`}
                    >
                        {inWatchlist ? <Check size={40} /> : <Plus size={40} />}
                        {inWatchlist ? 'Archived' : 'Add to Hub'}
                    </button>

                    <button
                        tabIndex="0"
                        onClick={() => onToggleVault && onToggleVault(details)}
                        className={`px-12 py-8 rounded-[3rem] font-black text-3xl uppercase tracking-widest outline-none transition-all flex items-center gap-4 border-4 
                            ${inVault
                                ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500 focus:bg-yellow-500 focus:text-black focus:scale-110'
                                : 'bg-black/50 backdrop-blur-xl border-white/20 text-white focus:border-neon-cyan focus:bg-white/10 focus:scale-110'
                            }`}
                    >
                        {inVault ? <Trophy size={40} /> : <Check size={40} />}
                        {inVault ? 'Watched' : 'Mark as Watched'}
                    </button>

                    <button
                        tabIndex="0"
                        onClick={onClose}
                        className="bg-black/50 backdrop-blur-xl text-white p-8 rounded-[3rem] font-black outline-none focus:bg-red-600 focus:border-red-600 focus:scale-110 transition-all border-4 border-white/20"
                    >
                        <X size={40} />
                    </button>
                </div>
            </div>

            {/* --- TV EPISODE ROW (IF IT'S A SERIES) --- */}
            {details.media_type === 'tv' && episodes.length > 0 && (
                <div className="absolute bottom-10 left-24 right-0 z-20">
                    <div className="flex items-center gap-6 mb-6 text-3xl font-black uppercase italic text-white/60">
                        <Monitor size={32} className="text-neon-cyan" />
                        Season {activeSeason} Logs
                    </div>
                    <div className="flex gap-8 overflow-x-auto no-scrollbar pb-10 pr-24 snap-x">
                        {episodes.map((ep) => (
                            <button
                                key={ep.id}
                                tabIndex="0"
                                onClick={() => onPlay({ ...details, season: activeSeason, episode: ep.episode_number })}
                                className="shrink-0 w-[450px] text-left group outline-none focus:scale-110 transition-all snap-center"
                            >
                                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-[6px] border-white/10 group-focus:border-neon-cyan group-focus:shadow-[0_0_50px_rgba(0,255,255,0.4)] mb-6 bg-zinc-900 transition-all">
                                    <img
                                        src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${ep.still_path}`}
                                        className="w-full h-full object-cover opacity-60 group-focus:opacity-100 transition-opacity"
                                        alt={ep.name}
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-focus:opacity-100 transition-opacity">
                                        <div className="bg-neon-cyan p-4 rounded-full shadow-neon">
                                            <Play fill="black" size={32} className="text-black ml-1" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-4 left-6 px-3 py-1 bg-black/80 rounded-xl text-xl font-black text-neon-cyan border border-white/10">
                                        EP {ep.episode_number}
                                    </div>
                                </div>
                                <h4 className="text-2xl font-black text-white truncate px-2">{ep.name}</h4>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TVMoreInfo;