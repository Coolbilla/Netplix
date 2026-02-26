import React, { useState, useEffect, useRef } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import {
    Search as SearchIcon, X, Sparkles, Zap, ShieldAlert,
    Cpu, Mic, MicOff, History, Trash2, Activity
} from 'lucide-react';




const Search = ({ onSelectMedia, onClose, voiceTranscript, isListening, toggleVoice }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('search_archive');
        return saved ? JSON.parse(saved) : [];
    });

    // SYNC: When App.jsx updates the transcript, update our input
    useEffect(() => {
        if (voiceTranscript) {
            setQuery(voiceTranscript);
        }
    }, [voiceTranscript]);



    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }

        setIsSearching(true);
        const delayDebounce = setTimeout(async () => {
            try {
                const { data } = await neuralFetch(
                    `/search/multi?query=${query}`
                );
                const filtered = data.results.filter(m => m.poster_path && (m.media_type === 'movie' || m.media_type === 'tv'));
                setResults(filtered);

                // Add to history if results found
                if (filtered.length > 0) {
                    addToHistory(query);
                }
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query]);

    const addToHistory = (q) => {
        const cleanQ = q.trim().toLowerCase();
        if (!cleanQ) return;
        const newHistory = [cleanQ, ...history.filter(i => i !== cleanQ)].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('search_archive', JSON.stringify(newHistory));
    };



    return (
        <div className="fixed inset-0 z-[500] bg-[#020202] flex flex-col animate-in fade-in duration-700 overflow-hidden font-sans">

            {/* BACKGROUND ANIMATION */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />
            </div>
            <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[600px] bg-neon-cyan/5 rounded-full blur-[160px]" />

            {/* HEADER HUD */}
            <div className="relative z-10 w-full p-8 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <Activity className="text-neon-cyan w-4 h-4" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/80">Neural Archive Access</h3>
                        </div>
                        <span className="text-[8px] text-zinc-600 font-mono mt-1">LATENCY: 14MS // ENCRYPTION: AES-256</span>
                    </div>
                </div>

                <button onClick={onClose} className="p-4 rounded-full border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/40 transition-all group">
                    <X className="w-5 h-5 text-zinc-500 group-hover:text-red-500 group-hover:rotate-90 transition-all" />
                </button>
            </div>

            {/* MAIN SEARCH INTERFACE */}
            <div className="relative z-10 w-full max-w-2xl mx-auto mt-10 mb-8 px-6">

                {/* RECENT SEARCHES CHIPS */}
                {history.length > 0 && (
                    <div className="flex items-center gap-4 mb-6 animate-in slide-in-from-left-4 duration-500">
                        <History size={12} className="text-zinc-500" />
                        <div className="flex gap-2">
                            {history.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setQuery(item)}
                                    className="px-3 py-1.5 rounded-md border border-white/5 bg-white/5 text-[9px] uppercase font-bold tracking-widest text-zinc-400 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="relative group">
                    {/* Outer Glow */}
                    <div className={`absolute -inset-1 bg-neon-cyan/20 rounded-3xl blur transition-opacity duration-500 ${isListening ? 'opacity-100' : 'opacity-0'}`} />

                    <div className={`relative flex items-center bg-black/60 border-2 rounded-2xl backdrop-blur-3xl transition-all duration-300 ${isListening ? 'border-neon-cyan' : 'border-white/10 group-focus-within:border-white/20'}`}>

                        {/* Search Icon */}
                        <div className="pl-6">
                            <SearchIcon className={`${isSearching ? 'text-neon-cyan animate-pulse' : 'text-zinc-600'}`} size={24} />
                        </div>

                        {/* The Input */}
                        <input
                            autoFocus
                            type="text"
                            placeholder={isListening ? "Listening to frequency..." : "Scan for media..."}
                            className="w-full bg-transparent py-5 pl-4 pr-4 text-2xl font-extralight tracking-tight text-white outline-none focus:outline-none focus:ring-0 placeholder:text-zinc-800"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />

                        {/* VOICE INTERFACE BUTTON */}
                        <div className="flex items-center pr-4">
                            <div className="w-[1px] h-8 bg-white/10 mx-3" /> {/* Divider */}
                            <button
                                onClick={toggleVoice}
                                className={`relative h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500 ${isListening
                                    ? 'bg-neon-cyan text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                                    : 'bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {isListening ? (
                                    <div className="flex gap-1 items-center">
                                        <span className="w-1 h-3 bg-black animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-1 h-5 bg-black animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-1 h-3 bg-black animate-bounce" />
                                    </div>
                                ) : (
                                    <Mic size={22} strokeWidth={1.5} />
                                )}

                                {/* Active Ping for Voice */}
                                {isListening && (
                                    <span className="absolute inset-0 rounded-xl bg-neon-cyan animate-ping opacity-20" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RESULTS FEED */}
            <div className="relative z-10 flex-1 overflow-y-auto px-8 md:px-20 pb-32 no-scrollbar">
                {results.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
                        {results.map((m, idx) => (
                            <div
                                key={m.id}
                                onClick={() => onSelectMedia({ ...m, media_type: m.media_type })}
                                className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-500"
                                style={{ animationDelay: `${idx * 40}ms` }}
                            >
                                <div className="relative aspect-[2/3] rounded-sm overflow-hidden border border-white/5 transition-all duration-500 group-hover:scale-[1.03] group-hover:border-neon-cyan/40">
                                    <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover" alt={m.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <div className="flex items-center gap-2 text-neon-cyan font-black text-[9px] italic tracking-tighter">
                                            <Zap size={10} fill="currentColor" /> DOWNLOAD DATA
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 px-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 truncate group-hover:text-white transition-colors">{m.title || m.name}</h4>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{m.media_type}</span>
                                        <span className="text-[8px] font-bold text-zinc-600 italic">#{m.id.toString().slice(-4)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query.length >= 2 && !isSearching ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-20">
                        <ShieldAlert size={48} strokeWidth={1} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero signals detected</p>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-[0.03] select-none pointer-events-none">
                        <h1 className="text-[15vw] font-black uppercase italic leading-none">Global</h1>
                        <h1 className="text-[15vw] font-black uppercase italic leading-none">Access</h1>
                    </div>
                )}
            </div>

            {/* HUD DECORATIVE FOOTER */}
            <div className="absolute bottom-8 w-full px-12 flex justify-between items-center pointer-events-none opacity-30">
                <span className="text-[8px] font-mono text-white/50 tracking-[0.5em]">SYSTEM_READY_STABLE</span>
                <div className="flex gap-4">
                    <div className="h-1 w-1 bg-neon-cyan rounded-full animate-ping" />
                    <div className="h-1 w-1 bg-white rounded-full opacity-20" />
                    <div className="h-1 w-1 bg-white rounded-full opacity-20" />
                </div>
                <span className="text-[8px] font-mono text-white/50 tracking-[0.5em]">LOG_SESSION: {new Date().getTime().toString().slice(-6)}</span>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .delay-75 { animation-delay: 75ms; }
                .delay-150 { animation-delay: 150ms; }
            `}</style>
        </div>
    );
};

export default Search;