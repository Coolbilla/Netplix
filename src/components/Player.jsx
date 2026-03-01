import React, { useState, useEffect, useRef } from 'react';
import { getFlixerUrl } from '../utils/cinezo';
import {
    Play, Info, Zap, Star, Calendar, ShieldCheck, Flame, X, Cpu, Shield,
    ChevronRight, ChevronLeft, ShieldAlert, MonitorPlay, CheckCircle, ChevronDown
} from 'lucide-react';

const Player = ({ media, toggleCompleted, onClose }) => {
    // Extract variables from the passed media object
    const tmdbId = media.id;
    const type = media.media_type || (media.first_air_date ? 'tv' : 'movie');
    const season = media.season || 1;
    const episode = media.episode || 1;

    const [activeServer, setActiveServer] = useState('cinezo');
    const [showAdWarning, setShowAdWarning] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // --- MARK 1: THE INTERCEPTOR STATE ---
    const [showPostPlay, setShowPostPlay] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setShowAdWarning(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // SERVER URLS
    const cinezoUrl = getFlixerUrl(tmdbId, type, season, episode);
    
    const vidoraUrl = type === 'tv'
        ? `https://vidora.su/tv/${tmdbId}/${season}/${episode}?autoplay=true&colour=00ffff`
        : `https://vidora.su/movie/${tmdbId}?autoplay=true&colour=00ffff`;
        
    const vidsrcUrl = type === 'tv'
        ? `https://vidsrc-embed.su/embed/${tmdbId}/${season}-${episode}`
        : `https://vidsrc-embed.su/embed/${tmdbId}`;

    const twoEmbedUrl = type === 'tv'
        ? `https://2embed.org/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://2embed.org/embed/movie/${tmdbId}`;

    // DETERMINE ACTIVE STREAM
    let streamUrl = cinezoUrl;
    if (activeServer === 'vidora') streamUrl = vidoraUrl;
    if (activeServer === 'vidsrc') streamUrl = vidsrcUrl;
    if (activeServer === '2embed') streamUrl = twoEmbedUrl;

    const handleMarkAsCompleted = () => {
        toggleCompleted(media); // Fires the function to move it to the Vault
        onClose(); // Officially closes the player
    };

    const serverOptions = [
        { id: 'cinezo', name: 'Server 1 (No Ads)' },
        { id: 'vidsrc', name: 'Server 2 (Fast)' },
        { id: 'vidora', name: 'Server 3' },
        { id: '2embed', name: 'Server 4 (Backup)' }
    ];

    // --- RENDER THE POST-PLAY SCREEN IF THEY CLICKED 'X' ---
    if (showPostPlay) {
        return (
            <div className="fixed inset-0 z- bg-[#020202] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 font-sans p-6">
                <div className="absolute inset-0 z-0">
                    <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${media.backdrop_path}`} className="w-full h-full object-cover opacity-20 blur-2xl saturate-200" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-[#020202]/80" />
                </div>

                <div className="relative z-10 max-w-2xl w-full bg-black/60 backdrop-blur-3xl border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center flex flex-col items-center">
                    <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${media.poster_path}`} className="w-32 md:w-48 aspect-[2/3] object-cover rounded-2xl shadow-2xl mb-8 border border-white/5" alt="" />
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">Finished Watching?</h2>
                    <p className="text-zinc-400 text-sm md:text-base font-medium mb-10 max-w-md">
                        Did you finish <span className="text-white">"{media.title || media.name}"</span>? Mark it as watched or keep it in your active history.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                        <button onClick={handleMarkAsCompleted} className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center justify-center gap-3 hover:scale-105 active:scale-95">
                            <CheckCircle size={20} /> Mark as Watched
                        </button>
                        <button onClick={onClose} className="glass-panel hover:bg-white/10 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10 flex items-center justify-center gap-3 hover:scale-105 active:scale-95">
                            Just Close
                        </button>
                    </div>

                    <button onClick={() => setShowPostPlay(false)} className="absolute top-6 left-6 text-zinc-500 hover:text-white flex items-center gap-2 text-[10px] uppercase font-black tracking-widest transition-colors">
                        <ChevronLeft size={16} /> Back to Video
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER THE NORMAL VIDEO PLAYER ---
    return (
        <div className="fixed inset-0 z- bg-[#020202] flex flex-col animate-in fade-in duration-500 overflow-hidden font-sans">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="absolute top-0 left-0 w-full p-4 md:p-8 z- flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pointer-events-none">
                
                {/* Left Side: Close Button & Title */}
                <div className="pointer-events-auto flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full shadow-2xl">
                    <button
                        onClick={() => setShowPostPlay(true)} // TRIGGERS THE INTERCEPTOR INSTEAD OF CLOSING
                        className="bg-white/10 hover:bg-red-500/80 text-white p-3 rounded-full transition-all duration-300 group"
                    >
                        <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <div className="flex flex-col justify-center">
                        <span className="text-[9px] md:text-[10px] font-black text-neon-cyan uppercase tracking-[0.3em]">
                            {type === 'tv' ? 'Series Engine' : 'Cinema Engine'}
                        </span>
                        <h2 className="text-white font-bold text-sm md:text-base tracking-wide max-w-[200px] md:max-w-md truncate">
                            {type === 'tv' ? `Season ${season} • Episode ${episode}` : media.title || media.name}
                        </h2>
                    </div>
                </div>

                {/* Right Side: Source Dropdown */}
                <div className="pointer-events-auto relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full shadow-2xl hover:bg-white/5 transition-colors"
                    >
                        <MonitorPlay size={16} className="text-zinc-400" />
                        <div className="flex flex-col items-start text-left">
                            <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest leading-none mb-1">Source Node</span>
                            <span className="text-xs font-bold text-white leading-none">
                                {serverOptions.find(s => s.id === activeServer)?.name}
                            </span>
                        </div>
                        <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-300 ml-2 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-full min-w-[200px] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {serverOptions.map((server) => (
                                <button
                                    key={server.id}
                                    onClick={() => {
                                        setActiveServer(server.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-4 text-xs font-bold transition-all flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 ${
                                        activeServer === server.id ? 'text-neon-cyan bg-neon-cyan/5' : 'text-zinc-300'
                                    }`}
                                >
                                    <span>{server.name}</span>
                                    {activeServer === server.id && <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan shadow-neon" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* The Video iframe Container */}
            <div className="flex-1 w-full h-full relative z- md:p-12 md:pt-28 pb-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-[1600px] mx-auto md:rounded-[2rem] overflow-hidden bg-black md:border border-white/10 md:shadow-[0_0_60px_rgba(0,0,0,0.8)] group">
                    <iframe 
                        key={streamUrl} 
                        src={streamUrl} 
                        className="w-full h-full border-none absolute inset-0" 
                        allowFullScreen 
                        allow="autoplay; encrypted-media" 
                        scrolling="no" 
                        title={`${activeServer} Stream`} 
                    />
                    <div className="absolute inset-0 border-2 border-neon-cyan/0 md:group-hover:border-neon-cyan/20 rounded-[inherit] transition-colors duration-700 pointer-events-none" />
                </div>
            </div>

            {/* Ad Warning */}
            {showAdWarning && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z- bg-black/80 backdrop-blur-xl border border-white/10 text-white pl-4 pr-2 py-2 rounded-full flex items-center gap-4 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-500 pointer-events-auto w-max max-w-[90vw]">
                    <ShieldAlert className="text-yellow-500 shrink-0" size={18} />
                    <p className="text-[10px] md:text-xs font-medium tracking-wide text-zinc-300 truncate">Using third-party servers. <strong className="text-white">Brave Browser</strong> recommended.</p>
                    <button onClick={() => setShowAdWarning(false)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors shrink-0"><X size={14} /></button>
                </div>
            )}
        </div>
    );
};

export default Player;
