import React, { useState, useEffect } from 'react';
import { TVNavigationProvider } from './TVNavigationProvider';
import Focusable from './Focusable';
import TVSidebar from './TVSidebar';
import TVRow from './TVRow';
import TVMoreInfo from './TVMoreInfo';
import TVPlayer from './TVPlayer';
import { Play, Info, Star, Calendar, ShieldCheck } from 'lucide-react';

const TVApp = ({
    user, trending, continueWatching, handlePlay, onLogin,
    activeMedia, closePlayer, selectedMoreInfo, closeMoreInfo, onMoreInfo,
    onSearchClick, onVibeSearch,
    activePage, toggleCompleted
}) => {
    const [currentPage, setCurrentPage] = useState(activePage || 'Home');
    const [focusedMedia, setFocusedMedia] = useState(null);

    useEffect(() => {
        if (trending && trending.length > 0 && !focusedMedia) {
            setFocusedMedia(trending[0]);
        }
    }, [trending, focusedMedia]);

    useEffect(() => {
        const handleRemoteBack = (e) => {
            if (activeMedia || selectedMoreInfo) return;
            if (e.key === 'Escape' || e.key === 'Backspace') {
                if (currentPage !== 'Home') setCurrentPage('Home');
            }
        };
        window.addEventListener('keydown', handleRemoteBack);
        return () => window.removeEventListener('keydown', handleRemoteBack);
    }, [currentPage, activeMedia, selectedMoreInfo]);

    const getFilteredData = (type, isAnime = false) => {
        if (!trending) return [];
        if (isAnime) return trending.filter(m => m.genre_ids?.includes(16) || m.original_language === 'ja');
        return trending.filter(m => m.media_type === type);
    };

    if (!focusedMedia) return <div className="bg-black w-screen h-screen" />;

    return (
        <TVNavigationProvider>
            <div className="fixed inset-0 bg-[#020202] text-white overflow-hidden font-sans selection:bg-transparent flex">

                {/* 1. FIXED BACKGROUND */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-black" />
                    <img
                        key={focusedMedia.id}
                        src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${focusedMedia.backdrop_path}`}
                        className="w-full h-full object-cover opacity-50 transition-opacity duration-1000 animate-in fade-in zoom-in duration-1000"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                    {/* Hub Watermark */}
                    <div className="absolute top-10 right-20 opacity-10 pointer-events-none">
                        <h1 className="text-[10rem] font-black italic tracking-tighter uppercase blur-sm">{currentPage}</h1>
                    </div>
                </div>

                {/* 2. SIDEBAR (Fixed left) */}
                <TVSidebar
                    activePage={currentPage}
                    onNavigate={setCurrentPage}
                    user={user}
                    onSearch={onSearchClick}
                    onVibeSearch={onVibeSearch}
                />

                {/* 3. SCROLLABLE MAIN CONTENT (Pushed right by ml-24 to avoid sidebar overlap) */}
                <div className="flex-1 relative z-10 overflow-y-auto no-scrollbar ml-24 scroll-smooth">

                    {/* Hero Metadata (Takes up top half of screen) */}
                    <div className="w-full min-h-[65vh] flex flex-col justify-end px-12 pb-12 pt-32">
                        <div className="max-w-4xl animate-in slide-in-from-left-10 duration-700">
                            <div className="flex items-center gap-6 mb-4 text-xl font-black uppercase tracking-[0.3em] text-zinc-400">
                                <span className="flex items-center gap-2 text-neon-cyan"><ShieldCheck size={24} /> 4K HDR</span>
                                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                <span className="flex items-center gap-2 text-yellow-400"><Star size={24} fill="currentColor" /> {focusedMedia.vote_average?.toFixed(1)}</span>
                                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                <span>{(focusedMedia.release_date || focusedMedia.first_air_date)?.split('-')[0]}</span>
                            </div>

                            <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-[0.9] mb-6 drop-shadow-2xl line-clamp-2">
                                {focusedMedia.title || focusedMedia.name}
                            </h1>

                            <p className="text-2xl text-zinc-300 leading-relaxed italic opacity-90 line-clamp-3 mb-10">
                                {focusedMedia.overview}
                            </p>

                            <div className="flex gap-6">
                                <Focusable
                                    onEnter={() => handlePlay(focusedMedia)}
                                    onClick={() => handlePlay(focusedMedia)}
                                    activeClass="bg-neon-cyan scale-110"
                                    className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xl uppercase tracking-widest outline-none transition-all flex items-center gap-4 cursor-pointer"
                                >
                                    <Play fill="black" size={28} /> Initialize
                                </Focusable>
                                <Focusable
                                    onEnter={() => onMoreInfo(focusedMedia)}
                                    onClick={() => onMoreInfo(focusedMedia)}
                                    activeClass="bg-white text-black scale-110"
                                    className="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest outline-none transition-all border-2 border-white/20 flex items-center gap-4 cursor-pointer"
                                >
                                    <Info size={28} /> Database
                                </Focusable>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Rows */}
                    <div className="pb-32 space-y-4">
                        {['Home', 'Movies', 'Series', 'Anime'].includes(currentPage) ? (
                            <>
                                {currentPage === 'Home' && continueWatching?.length > 0 && (
                                    <TVRow title="Continue Session" data={continueWatching} onSelect={handlePlay} onInfo={onMoreInfo} onFocusItem={setFocusedMedia} />
                                )}
                                <TVRow
                                    title={`${currentPage === 'Home' ? 'Global Trending' : currentPage + ' Trending'}`}
                                    data={currentPage === 'Home' ? trending : currentPage === 'Movies' ? getFilteredData('movie') : currentPage === 'Series' ? getFilteredData('tv') : getFilteredData('tv', true)}
                                    onSelect={handlePlay} onInfo={onMoreInfo} onFocusItem={setFocusedMedia}
                                />
                                <TVRow
                                    title="New Arrivals"
                                    data={trending.slice().reverse()}
                                    onSelect={handlePlay} onInfo={onMoreInfo} onFocusItem={setFocusedMedia}
                                />
                            </>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                                <div className="p-10 rounded-[3rem] bg-white/5 border-2 border-white/10 backdrop-blur-xl shadow-2xl mb-10">
                                    <h1 className="text-7xl font-black italic uppercase tracking-tighter text-white">
                                        {currentPage} <span className="text-neon-cyan">Hub</span>
                                    </h1>
                                </div>
                                <p className="text-3xl text-zinc-500 uppercase tracking-[0.5em] font-black italic">
                                    Module under construction
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {selectedMoreInfo && (
                    <TVMoreInfo
                        media={selectedMoreInfo}
                        onClose={closeMoreInfo}
                        onPlay={(m) => { handlePlay(m); closeMoreInfo(); }}
                        user={user}
                        onAddToList={onAddToList}
                        onToggleVault={toggleCompleted}
                    />
                )}

                {activeMedia && (
                    <TVPlayer
                        media={activeMedia}
                        onClose={closePlayer}
                        toggleCompleted={toggleCompleted}
                    />
                )}
            </div>
        </TVNavigationProvider>
    );
};

export default TVApp;
