import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import axios from 'axios';
import {
    Terminal, Zap, X, ChevronLeft, List, Tv, Newspaper, Ghost, Monitor, Activity, Cpu, AlertTriangle
} from 'lucide-react';

const CHANNELS_API = 'https://iptv-org.github.io/api/channels.json';
const STREAMS_API = 'https://iptv-org.github.io/api/streams.json';

const CustomLivePlayer = ({
    channelName: initialName, streamUrl: initialUrl, onBack, setStreamUrl, setChannelName, categorizedSignals: initialMatrix
}) => {
    const isMounted = React.useRef(true);
    const [lastCommand, setLastCommand] = useState("SIGNAL_READY");
    const [showTerminal, setShowTerminal] = useState(true);
    const [showSidebar, setShowSidebar] = useState(false);
    const [activeCategory, setActiveCategory] = useState('entertainment');
    const [categorizedSignals, setCategorizedSignals] = useState(initialMatrix || {});

    // INTERNAL SIGNAL MANAGEMENT (Autonomous Mode)
    const [currentSignal, setCurrentSignal] = useState({
        name: initialName,
        url: initialUrl
    });

    const [isSyncing, setIsSyncing] = useState(true);
    const [hasError, setHasError] = useState(false);

    const categories = [
        { id: 'entertainment', name: 'Entertainment', icon: <Tv size={14} />, keywords: ['movie', 'ent', 'series'] },
        { id: 'news', name: 'News', icon: <Newspaper size={14} />, keywords: ['news', 'info'] },
        { id: 'anime', name: 'Anime', icon: <Zap size={14} />, keywords: ['anime'] },
        { id: 'kids', name: 'Kids', icon: <Ghost size={14} />, keywords: ['kids', 'disney', 'cartoon'] },
    ];

    // INTERNAL SIGNAL MATRIX FETCHING (Only if not provided by prop)
    useEffect(() => {
        isMounted.current = true;
        if (initialMatrix && Object.keys(initialMatrix).length > 0) return;

        const fetchSignals = async () => {
            try {
                const [channelsRes, streamsRes] = await Promise.all([
                    axios.get(CHANNELS_API),
                    axios.get(STREAMS_API)
                ]);

                if (!isMounted.current) return;

                const streamsMap = new Map(streamsRes.data.map(s => [s.channel, s.url]));
                const signals = channelsRes.data
                    .filter(ch => streamsMap.has(ch.id))
                    .map(ch => ({
                        id: ch.id,
                        name: ch.name,
                        image: ch.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${ch.name}`,
                        url: streamsMap.get(ch.id),
                        categories: ch.categories || []
                    }));

                // Group by Categories
                const matrix = {};
                categories.forEach(cat => {
                    matrix[cat.id] = signals.filter(s =>
                        s.categories.some(c => c.toLowerCase().includes(cat.id)) ||
                        cat.keywords.some(k => s.name.toLowerCase().includes(k))
                    ).slice(0, 50); // Performance cap for sidebar
                });

                setCategorizedSignals(matrix);
                setLastCommand("MATRIX_SYNC_COMPLETE");
            } catch (err) {
                if (!isMounted.current) return;
                console.error("Signal Matrix Sync Failed", err);
                setLastCommand("ERR_SIGNAL_TIMEOUT");
            }
        };
        fetchSignals();
        return () => { isMounted.current = false; };
    }, []);

    // RESET STATES ON URL CHANGE (Internal & External)
    useEffect(() => {
        // Only reset if the URL is actually different to prevent infinite loops
        if (initialUrl !== currentSignal.url) {
            setIsSyncing(true);
            setHasError(false);
            setLastCommand(`TUNING_TO: ${initialName?.toUpperCase() || 'SIGNAL'}`);
            setCurrentSignal({ name: initialName, url: initialUrl });
        }
    }, [initialUrl, initialName]); // currentSignal omitted to prevent loop

    const handleSelectNode = (ch) => {
        setCurrentSignal({
            name: ch.name,
            url: ch.url
        });
        if (setStreamUrl) setStreamUrl(ch.url);
        if (setChannelName) setChannelName(ch.name);
        setLastCommand(`SYNC_PRIMARY: ${ch.name}`);
        setShowSidebar(false);
    };

    return (
        <div className="min-h-screen bg-[#020617] pt-24 pb-32 px-4 md:px-12 relative overflow-hidden font-mono selection:bg-neon-cyan/30">
            <style>
                {`
                    @keyframes progress-load {
                        0% { width: 0%; }
                        50% { width: 70%; }
                        100% { width: 100%; }
                    }
                    .animate-progress-load { animation: progress-load 3s ease-in-out infinite; }
                    .animate-spin-slow { animation: spin 4s linear infinite; }
                `}
            </style>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

            {/* --- MINIMALIST COMMAND HUD --- */}
            {showTerminal && (
                <div className="fixed bottom-10 left-6 z-[600] flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-left-10 duration-700">
                    <Terminal size={16} className="text-neon-cyan animate-pulse" />
                    <div className="flex flex-col border-l border-white/10 pl-4">
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">Console_Link</span>
                        <code className="text-[11px] text-neon-cyan uppercase tracking-tighter font-bold">{lastCommand}</code>
                    </div>
                </div>
            )}

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* HEADER HUD */}
                <header className="flex items-center justify-between mb-10 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-6">
                        <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-neon-cyan border border-white/5 transition-all active:scale-95">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex flex-col">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-1">
                                Neural_Uplink_Established
                            </p>
                            <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter truncate max-w-md">
                                {currentSignal.name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowSidebar(true)}
                            className="flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-white border border-white/10 transition-all active:scale-95 group"
                        >
                            <List size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Matrix</span>
                        </button>
                    </div>
                </header>

                {/* THE PLAYER CORE */}
                <div className="relative aspect-video w-full rounded-[3rem] overflow-hidden border border-neon-cyan/20 bg-black shadow-2xl group transition-all duration-700 hover:border-neon-cyan/40">
                    {/* Grid Overlay for Cyberpunk look */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10" />

                    {/* LOADING OVERLAY */}
                    {isSyncing && !hasError && (
                        <div className="absolute inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center gap-6">
                            <Activity size={60} className="text-neon-cyan animate-pulse opacity-20" />
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.8em] animate-pulse">Syncing_Signal</p>
                                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-neon-cyan animate-progress-load shadow-neon" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ERROR OVERLAY */}
                    {hasError && (
                        <div className="absolute inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center gap-4">
                            <AlertTriangle size={48} className="text-red-500" />
                            <h3 className="text-white font-black uppercase text-sm">Signal_Lost</h3>
                            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] text-white">Re-Scan Node</button>
                        </div>
                    )}

                    <ReactPlayer
                        url={currentSignal.url}
                        playing={true}
                        controls={true}
                        width="100%"
                        height="100%"
                        playsinline
                        onReady={() => isMounted.current && setIsSyncing(false)}
                        onStart={() => {
                            if (!isMounted.current) return;
                            setIsSyncing(false);
                            setLastCommand("DECRYPT_SUCCESS");
                        }}
                        onBuffer={() => isMounted.current && setIsSyncing(true)}
                        onBufferEnd={() => isMounted.current && setIsSyncing(false)}
                        onError={(e) => {
                            if (!isMounted.current) return;
                            console.error("Signal Error:", e);
                            setHasError(true);
                            setIsSyncing(false);
                            setLastCommand("ERR_SIGNAL_LOST");
                        }}
                        config={{
                            file: {
                                forceHLS: true,
                                attributes: {
                                    crossOrigin: "anonymous",
                                    // This prevents the browser from being picky about the source
                                    playsInline: true
                                },
                                hlsOptions: {
                                    enableWorker: true,
                                    lowLatencyMode: true,
                                    // Critical for bypassing 401/403 errors on IPTV-org links
                                    xhrSetup: function (xhr) {
                                        xhr.withCredentials = false;
                                    }
                                }
                            }
                        }}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                    />

                    {/* Active Signal HUD */}
                    <div className="absolute bottom-8 left-8 z-20 px-5 py-2 bg-black/80 backdrop-blur-md rounded-full border border-neon-cyan text-[10px] font-black text-neon-cyan uppercase tracking-widest shadow-neon-sm">
                        🔊 Signal_Active: {currentSignal.name}
                    </div>
                </div>
            </div>

            {/* --- SIGNAL MATRIX SIDEBAR --- */}
            <aside className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-black/40 backdrop-blur-3xl border-l border-white/10 z-[700] transition-transform duration-700 ease-in-out ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Signal Matrix</h3>
                            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-[0.2em] mt-1">
                                Switching Node Sequence
                            </p>
                        </div>
                        <button onClick={() => setShowSidebar(false)} className="p-3 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all">
                            <X size={28} />
                        </button>
                    </div>

                    {/* Category Selector */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar mb-10 pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${activeCategory === cat.id ? 'bg-neon-cyan text-black border-transparent shadow-neon' : 'bg-white/5 text-zinc-500 border-white/5 hover:border-white/10'}`}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Channel List */}
                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pr-4">
                        {categorizedSignals?.[activeCategory]?.map((ch) => (
                            <div
                                key={ch.id || ch.name}
                                onClick={() => handleSelectNode(ch)}
                                className={`group flex items-center gap-5 p-5 rounded-[2rem] border transition-all cursor-pointer ${currentSignal.name === ch.name
                                    ? 'bg-neon-cyan/10 border-neon-cyan/50 shadow-neon-sm'
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 p-3 shrink-0 flex items-center justify-center">
                                    <img src={ch.image} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-[12px] font-black text-white uppercase truncate tracking-tight">{ch.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Uplink: Online</p>
                                    </div>
                                </div>
                                <Zap size={16} className={`transition-all duration-500 ${currentSignal.name === ch.name ? 'text-neon-cyan drop-shadow-neon' : 'text-zinc-800 group-hover:text-neon-cyan'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default CustomLivePlayer;