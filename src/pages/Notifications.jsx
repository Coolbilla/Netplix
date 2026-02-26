import React, { useState, useEffect } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import { Bell, Film, Tv, Zap, Calendar, Play } from 'lucide-react';





const Notifications = ({ onMoreInfo, handlePlay }) => {
    const [newsFeed, setNewsFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                // Fetch Upcoming Movies, TV Shows Airing Today, and Trending Anime
                const [moviesRes, tvRes, animeRes] = await Promise.all([
                    neuralFetch(`/movie/upcoming?language=en-US&page=1`),
                    neuralFetch(`/tv/on_the_air?language=en-US&page=1`),
                    neuralFetch(`/discover/tv?with_genres=16&sort_by=popularity.desc&page=1`)
                ]);

                // Format data to look like notifications
                const movies = (moviesRes.data.results || []).map(m => ({ ...m, type: 'movie', label: 'Upcoming Movie Release', date: m.release_date, icon: <Film size={16} /> }));
                const tvShows = (tvRes.data.results || []).map(t => ({ ...t, type: 'tv', label: 'New Episode Airing', date: t.first_air_date, icon: <Tv size={16} /> }));
                const anime = (animeRes.data.results || []).map(a => ({ ...a, type: 'anime', label: 'Trending Anime', date: a.first_air_date, icon: <Zap size={16} className="text-yellow-500" /> }));

                // Combine and sort them so they are mixed together nicely
                const combined = [...movies, ...tvShows, ...anime].sort(() => 0.5 - Math.random());
                setNewsFeed(combined);
            } catch (error) {
                console.error("Error fetching news:", error);
            }
            setLoading(false);
        };

        fetchNews();
    }, []);

    const filteredFeed = filter === 'All' ? newsFeed : newsFeed.filter(item => item.type === filter);

    const filters = [
        { name: 'All', value: 'All' },
        { name: 'Movies', value: 'movie' },
        { name: 'TV Shows', value: 'tv' },
        { name: 'Anime', value: 'anime' }
    ];

    return (
        <div className="min-h-screen bg-[#020617] pt-24 pb-32 px-4 md:px-12 relative overflow-hidden">
            {/* Aurora Background Accents */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-neon-cyan/10 blur-[100px] rounded-full animate-pulse delay-700" />

            {/* Content Wrap */}
            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header & Sub-categories */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 mb-2 opacity-60">
                            <div className="h-px w-8 bg-red-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Broadcast Center</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter flex items-center gap-4 text-white uppercase transform -skew-x-6">
                            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-white aurora-stroke">Updates</span>
                        </h1>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {filters.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setFilter(f.value)}
                                className={`
                                    px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300
                                    ${filter === f.value
                                        ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-105'
                                        : 'glass-panel text-zinc-400 hover:text-white border border-white/5 hover:border-white/20'}
                                `}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feed List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Syncing Intel...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredFeed.map((item, index) => (
                            <div
                                key={`${item.id}-${index}`}
                                className="group relative flex gap-5 glass-panel p-5 rounded-3xl border border-white/5 hover:border-neon-cyan/40 transition-all duration-500 cursor-pointer overflow-hidden group hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                                onClick={() => onMoreInfo(item)}
                            >
                                {/* Glint Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                                {/* Notification Thumbnail */}
                                <div className="w-28 md:w-40 aspect-[4/3] rounded-2xl overflow-hidden shrink-0 relative border border-white/5 shadow-2xl">
                                    <img
                                        src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}`}
                                        alt={item.title || item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 transform scale-0 group-hover:scale-100 transition-transform duration-500">
                                            <Play size={20} className="text-white fill-white ml-1" />
                                        </div>
                                    </div>
                                    {/* Type Badge */}
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1.5">
                                        <span className="text-neon-cyan">{item.icon}</span>
                                    </div>
                                </div>

                                {/* Notification Details */}
                                <div className="flex flex-col justify-between flex-1 min-w-0 py-1">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neon-cyan/80">
                                                {item.label}
                                            </span>
                                            <div className="h-1 w-1 bg-zinc-600 rounded-full" />
                                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-1">
                                                <Calendar size={10} />
                                                {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBA'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg md:text-xl font-black text-white mb-2 line-clamp-1 group-hover:text-neon-cyan transition-colors tracking-tight">
                                            {item.title || item.name}
                                        </h3>
                                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                                            {item.overview}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-5 h-5 rounded-full border border-[#020617] bg-zinc-800 flex items-center justify-center animate-in zoom-in slide-in-from-left-2" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                                                </div>
                                            ))}
                                            <span className="pl-4 text-[9px] font-bold text-zinc-500 uppercase tracking-widest">+1.2k tracking</span>
                                        </div>
                                        <div className="h-0.5 w-0 group-hover:w-12 bg-red-600 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;