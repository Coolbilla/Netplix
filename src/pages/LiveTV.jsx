import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    Search, Zap, Newspaper, Tv, GraduationCap,
    Ghost, Activity, Cpu, Pin, Star, Globe, ChevronDown
} from 'lucide-react';

const CHANNELS_API = 'https://iptv-org.github.io/api/channels.json';
const STREAMS_API = 'https://iptv-org.github.io/api/streams.json';

const LiveTV = ({ onTuneChannel, categorizedChannels: initialMatrix, setCategorizedChannels: setLiftedMatrix }) => {
    const [allChannels, setAllChannels] = useState([]);
    const [categorizedChannels, setCategorizedChannels] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [favorites, setFavorites] = useState([]);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    const categories = [
        { id: 'entertainment', name: 'Cinema', icon: <Tv size={18} />, keywords: ['movie', 'ent', 'series'] },
        { id: 'news', name: 'News', icon: <Newspaper size={18} />, keywords: ['news', 'info'] },
        { id: 'anime', name: 'Anime', icon: <Zap size={18} />, keywords: ['anime'] },
        { id: 'kids', name: 'Kids', icon: <Ghost size={18} />, keywords: ['kids', 'disney', 'cartoon'] },
    ];

    // 1. DATA INITIALIZATION
    useEffect(() => {
        const fetchIPTVData = async () => {
            try {
                const [channelsRes, streamsRes] = await Promise.all([
                    axios.get(CHANNELS_API),
                    axios.get(STREAMS_API)
                ]);

                const streamsMap = new Map(streamsRes.data.map(s => [s.channel, s.url]));

                const validChannels = channelsRes.data
                    .filter(ch => streamsMap.has(ch.id))
                    .map(ch => ({
                        id: ch.id,
                        name: ch.name,
                        country: ch.country, // e.g., "US", "IN", "JP"
                        image: ch.logo || `https://api.dicebear.com/7.x/identicon/svg?seed=${ch.name}`,
                        url: streamsMap.get(ch.id),
                        categories: ch.categories || []
                    }));

                setAllChannels(validChannels);

                // If lifting state, generate the matrix now
                if (setLiftedMatrix) {
                    const matrix = {};
                    categories.forEach(cat => {
                        matrix[cat.id] = validChannels.filter(s =>
                            s.categories.some(c => c.toLowerCase().includes(cat.id)) ||
                            cat.keywords.some(k => s.name.toLowerCase().includes(k))
                        ).slice(0, 50);
                    });
                    setLiftedMatrix(matrix);
                }

                setLoading(false);
            } catch (err) {
                console.error("Satellite Link Failed", err);
                setLoading(false);
            }
        };
        fetchIPTVData();
        setFavorites(JSON.parse(localStorage.getItem('fav_channels') || '[]'));
    }, []);

    // 2. DYNAMIC FILTERING ENGINE
    const countryList = useMemo(() => {
        const codes = [...new Set(allChannels.map(ch => ch.country))].filter(Boolean).sort();
        return codes;
    }, [allChannels]);

    const filteredMatrix = useMemo(() => {
        let list = allChannels;

        // Filter by Country
        if (selectedCountry !== 'all') {
            list = list.filter(ch => ch.country === selectedCountry);
        }

        // Filter by Category Tab
        if (activeTab !== 'all') {
            list = list.filter(ch =>
                ch.categories.some(c => c.toLowerCase().includes(activeTab)) ||
                categories.find(cat => cat.id === activeTab).keywords.some(k => ch.name.toLowerCase().includes(k))
            );
        }

        // Filter by Search
        if (searchQuery) {
            list = list.filter(ch => ch.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        return list.slice(0, 300); // Performance cap
    }, [allChannels, selectedCountry, activeTab, searchQuery]);

    const toggleFavorite = (e, ch) => {
        e.stopPropagation();
        const updated = favorites.find(f => f.id === ch.id)
            ? favorites.filter(f => f.id !== ch.id)
            : [...favorites, ch];
        setFavorites(updated);
        localStorage.setItem('fav_channels', JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen bg-[#020617] pt-28 pb-32 px-6 md:px-12 font-mono text-white relative">

            {/* TOP HUD: SECTOR SELECTION */}
            <header className="max-w-[1400px] mx-auto mb-16 border-b border-white/5 pb-12 flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe size={14} className="text-neon-cyan animate-spin-slow" />
                            <span className="text-[10px] font-black tracking-[0.4em] text-zinc-500 uppercase">Global_Uplink_Active</span>
                        </div>
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase">Live_Matrix</h1>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    {/* COUNTRY DROPDOWN */}
                    <div className="relative group min-w-[180px]">
                        <button
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="w-full flex items-center justify-between px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-neon-cyan transition-all"
                        >
                            <span>Sector: {selectedCountry}</span>
                            <ChevronDown size={14} className={showCountryDropdown ? 'rotate-180' : ''} />
                        </button>

                        {showCountryDropdown && (
                            <div className="absolute top-full mt-2 w-full h-64 bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl z-[100] overflow-y-auto no-scrollbar shadow-2xl animate-in fade-in zoom-in-95">
                                <button onClick={() => { setSelectedCountry('all'); setShowCountryDropdown(false) }} className="w-full text-left px-6 py-4 hover:bg-neon-cyan hover:text-black text-[10px] font-black uppercase transition-all">Global_Feed</button>
                                {countryList.map(code => (
                                    <button
                                        key={code}
                                        onClick={() => { setSelectedCountry(code); setShowCountryDropdown(false) }}
                                        className="w-full text-left px-6 py-4 hover:bg-neon-cyan hover:text-black text-[10px] font-black uppercase transition-all"
                                    >
                                        Sector_{code}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative flex-1 group max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-neon-cyan" size={18} />
                        <input
                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-12 outline-none focus:border-neon-cyan text-xs font-black uppercase"
                            placeholder="Scan Signal..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto space-y-12">
                {/* Favorites Section stays the same... */}
                {favorites.length > 0 && searchQuery === '' && (
                    <section className="mb-20">
                        <div className="flex items-center gap-4 mb-8 opacity-40 uppercase text-[9px] font-black tracking-[0.5em]">
                            <Pin size={12} className="rotate-45" /> Pinned_Signals
                        </div>
                        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
                            {favorites.map(ch => (
                                <ChannelCard key={ch.id} ch={ch} isFav={true} onTune={onTuneChannel} onToggle={toggleFavorite} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Tab Navigator */}
                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveTab('all')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === 'all' ? 'bg-white text-black' : 'bg-white/5 text-zinc-500 border-white/5'}`}>All_Nodes</button>
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setActiveTab(cat.id)} className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeTab === cat.id ? 'bg-neon-cyan text-black' : 'bg-white/5 text-zinc-500 border-white/5'}`}>{cat.icon} {cat.name}</button>
                    ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-20"><Cpu className="animate-spin" size={40} /><p className="text-[10px] font-black tracking-[0.5em]">Syncing_Global_Array</p></div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 pt-8">
                        {filteredMatrix.map(ch => (
                            <ChannelCard key={ch.id} ch={ch} isFav={favorites.some(f => f.id === ch.id)} onTune={onTuneChannel} onToggle={toggleFavorite} />
                        ))}
                    </div>
                )}
            </main>

            {/* --- NEURAL NEWS TICKER (STAY AT BOTTOM) --- */}
            <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 py-3 z-[100] overflow-hidden">
                {/* Inline Animation Style */}
                <style>
                    {`
                        @keyframes marquee {
                            0% { transform: translateX(0); }
                            100% { transform: translateX(-50%); }
                        }
                        .animate-marquee-infinite {
                            display: flex;
                            width: max-content;
                            animation: marquee 40s linear infinite;
                        }
                    `}
                </style>

                <div className="animate-marquee-infinite flex items-center gap-12">
                    {/* We repeat the content twice for a seamless infinite loop */}
                    {[1, 2].map((group) => (
                        <div key={group} className="flex items-center gap-12 pr-12">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                                <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                                    Live_Feed_Status: <span className="text-neon-cyan italic">Connected</span>
                                </p>
                            </div>

                            <div className="h-4 w-px bg-white/10" />

                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                Active_Sector: <span className="text-white">Sector_{selectedCountry.toUpperCase()}</span>
                            </p>

                            <div className="h-4 w-px bg-white/10" />

                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                Matrix_Throughput: <span className="text-neon-purple font-mono italic">8.4 GB/S</span>
                            </p>

                            <div className="h-4 w-px bg-white/10" />

                            <p className="text-[10px] font-black text-neon-cyan uppercase tracking-widest animate-pulse">
                                Neural_Link_Ready // 2026_UPLINK_STABLE
                            </p>

                            <div className="h-4 w-px bg-white/10" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ... ChannelCard stays the same as previous version ...
const ChannelCard = ({ ch, isFav, onTune, onToggle }) => (
    <div
        onClick={() => onTune(ch)}
        className="group relative aspect-square rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center p-6 cursor-pointer transition-all hover:border-neon-cyan/50 hover:-translate-y-2"
    >
        <button onClick={(e) => onToggle(e, ch)} className={`absolute top-4 right-4 p-2 rounded-full z-20 ${isFav ? 'bg-neon-cyan text-black shadow-neon' : 'text-zinc-800 opacity-0 group-hover:opacity-100 hover:text-white'}`}>
            <Star size={10} fill={isFav ? "currentColor" : "none"} />
        </button>
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-black border border-white/5 p-4 mb-4 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
            <img src={ch.image} className="w-full h-full object-contain grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100" alt="" />
        </div>
        <div className="text-center w-full px-2">
            <h4 className="text-[10px] font-black text-white/40 group-hover:text-white uppercase truncate">{ch.name}</h4>
            <p className="text-[7px] font-bold text-zinc-700 uppercase mt-1">Sector_{ch.country}</p>
        </div>
    </div>
);

export default LiveTV;