import React, { useState } from 'react';
import { Play, Trash2, Info, Film, Zap, CheckCircle, Trophy, Undo2 } from 'lucide-react';

const MyList = ({ user, handlePlay, toggleWatchlist, toggleCompleted, onMoreInfo }) => {
    // Determine if we are looking at Watchlist or Vault
    const [activeListTab, setActiveListTab] = useState('watchlist');

    // Genre filters
    const [activeGenreTab, setActiveGenreTab] = useState('All');

    const watchlist = user?.watchlist || [];
    const completed = user?.completed || [];

    // Choose which list to map over based on the active top tab
    const currentList = activeListTab === 'watchlist' ? watchlist : completed;
    const categories = ['All', 'Movies', 'TV Shows', 'Anime'];

    const filteredList = currentList.filter(item => {
        if (activeGenreTab === 'All') return true;
        if (activeGenreTab === 'Movies') return item.media_type === 'movie' && !item.isAnime;
        if (activeGenreTab === 'TV Shows') return item.media_type === 'tv' && !item.isAnime;
        if (activeGenreTab === 'Anime') return item.isAnime === true;
        return true;
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-[#020617] pt-32 px-6 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Trophy size={64} className="text-zinc-700 mx-auto" />
                    <h2 className="text-2xl font-black text-white uppercase tracking-widest">Access Denied</h2>
                    <p className="text-zinc-500">Please login to view your Vault.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] pt-24 md:pt-32 px-6 md:px-12 pb-20 relative overflow-hidden">
            {/* Atmospheric Background Layers */}
            <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none z-0" />

            {/* 1. Refined Header HUD */}
            <header className="relative z-10 mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-px w-12 bg-neon-purple" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">
                            System Archive
                        </h3>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
                        Your <span className={activeListTab === 'watchlist' ? 'text-neon-purple' : 'text-yellow-500'}>Collection</span>
                        {activeListTab === 'completed' && <Trophy className="text-yellow-500" size={36} />}
                    </h2>
                </div>

                {/* --- MASTER VAULT SWITCHER --- */}
                <div className="flex items-center gap-4 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5 w-max">
                    <button
                        onClick={() => setActiveListTab('watchlist')}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${activeListTab === 'watchlist' ? 'bg-neon-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Active Watchlist
                    </button>
                    <button
                        onClick={() => setActiveListTab('completed')}
                        className={`px-6 py-3 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${activeListTab === 'completed' ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Watched History
                    </button>
                </div>
            </header>

            {/* Category Selector HUD */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6 mb-12">
                <div className="flex flex-wrap gap-3">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveGenreTab(cat)}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${activeGenreTab === cat
                                ? `bg-white/10 text-white border-white/20 shadow-lg scale-105`
                                : 'bg-transparent text-zinc-500 border-white/5 hover:border-white/20 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <span className="glass-panel px-4 py-2 rounded-xl text-xs font-black text-neon-cyan border-neon-cyan/20 uppercase tracking-widest shrink-0">
                    {filteredList.length} {filteredList.length === 1 ? 'Entry' : 'Entries'} Detected
                </span>
            </div>

            {/* 2. Responsive Glass Grid */}
            <div className="relative z-10">
                {filteredList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6 md:gap-8">
                        {filteredList.map((m) => (
                            <div
                                key={m.id}
                                tabIndex="0"
                                role="button"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onMoreInfo(m);
                                    if (e.key === ' ') { e.preventDefault(); handlePlay(m); }
                                }}
                                className="poster-hover group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5 shadow-2xl transition-all duration-500 focus:outline-none focus:scale-105 focus:z-50 focus:border-neon-purple/50"
                            >
                                {/* Media Poster */}
                                <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={m.title || m.name} />

                                {/* Interactive Glass Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-5">
                                    <div className="space-y-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex items-center gap-2">
                                            {activeListTab === 'completed' ? <Trophy size={12} className="text-yellow-500" /> : <Zap size={12} className="text-neon-cyan fill-neon-cyan" />}
                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate">
                                                {m.title || m.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            {/* Standard Play Button */}
                                            <button onClick={(e) => { e.stopPropagation(); handlePlay(m); }} className="bg-white text-black p-2 md:p-2.5 rounded-xl hover:bg-neon-cyan transition-all transform active:scale-90 shadow-neon" title="Initiate Playback">
                                                <Play fill="black" size={16} />
                                            </button>

                                            {/* Info Button */}
                                            <button onClick={(e) => { e.stopPropagation(); onMoreInfo(m); }} className="glass-button p-2 md:p-2.5 rounded-xl text-white border-white/10 hover:border-white transition-all" title="View Data">
                                                <Info size={16} />
                                            </button>

                                            {/* Dynamic Action Button based on Tab */}
                                            {activeListTab === 'watchlist' ? (
                                                <>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleWatchlist(m); }} className="ml-auto glass-button p-2.5 rounded-xl text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white transition-all" title="Remove">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); toggleCompleted(m); toggleWatchlist(m); }} className="glass-button p-2.5 rounded-xl text-yellow-500 border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all" title="Mark as Watched">
                                                        <CheckCircle size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={(e) => { e.stopPropagation(); toggleCompleted(m); }} className="ml-auto glass-button p-2.5 rounded-xl text-zinc-400 border-white/10 hover:bg-red-500 hover:text-white transition-all" title="Remove from Watched">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* HUD Identity Border (Hover) */}
                                {activeListTab === 'completed' && <div className="absolute inset-0 border-2 border-yellow-500/50 rounded-[inherit] pointer-events-none" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* 3. High-Tech Empty State */
                    <div className="flex flex-col items-center justify-center mt-20 md:mt-32 space-y-8 text-center fade-up">
                        <div className="relative">
                            <div className={`absolute inset-0 blur-3xl rounded-full ${activeListTab === 'completed' ? 'bg-yellow-500/20' : 'bg-neon-purple/20'}`} />
                            <div className="relative p-10 glass-panel rounded-full border border-white/10 shadow-2xl">
                                {activeListTab === 'completed' ? <Trophy size={64} className="text-zinc-700" /> : <Film size={64} className="text-zinc-700 animate-pulse" />}
                            </div>
                        </div>

                        <div className="space-y-4 max-w-sm">
                            <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">
                                HUD Archive <span className={activeListTab === 'completed' ? 'text-yellow-500' : 'text-neon-purple'}>Empty</span>
                            </h4>
                            <p className="text-sm text-zinc-500 leading-relaxed font-light italic">
                                No {activeGenreTab === 'All' ? 'content' : activeGenreTab.toLowerCase()} detected in this sector.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyList;