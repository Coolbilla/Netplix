import React, { useState, useEffect, useRef, memo } from 'react';
import { neuralFetch, IMAGE_BASE } from '../utils/neuralFetch';
import { Play, Plus, Info, Check, Star, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';





// --- THE MINI-ENGINE: Memoized Movie Tile ---
const MovieTile = memo(({ movie, onSelectMedia, onInfoClick, user }) => {
    const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    const inWatchlist = user?.watchlist?.some(item => item.id === movie.id);

    const handleToggleList = async (e) => {
        e.stopPropagation();
        if (!user) return alert("Please login to manage your list!");
        const userRef = doc(db, "users", user.uid);
        const movieData = { id: movie.id, title: movie.title || movie.name, poster_path: movie.poster_path, media_type: mediaType };

        try {
            if (inWatchlist) {
                await updateDoc(userRef, { watchlist: arrayRemove(movieData) });
            } else {
                await updateDoc(userRef, { watchlist: arrayUnion(movieData) });
            }
        } catch (error) { console.error("Watchlist Error:", error); }
    };

    return (
        <div
            tabIndex="0"
            role="button"
            aria-label={`${movie.title || movie.name}`}
            className="poster-hover shrink-0 w-40 md:w-56 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer relative border border-white/5 group shadow-2xl focus:scale-105 focus:z-50 focus:outline-neon-cyan active:scale-95 transition-all duration-500"
            onClick={() => onInfoClick({ ...movie, media_type: mediaType })}
            onKeyDown={(e) => {
                if (e.key === 'Enter') onInfoClick({ ...movie, media_type: mediaType });
                if (e.key === ' ') {
                    e.preventDefault();
                    onSelectMedia({ ...movie, media_type: mediaType });
                }
            }}
        >
            {/* 1. Base Poster (OPTIMIZED) */}
            <img
                src={`${IMAGE_BASE}/w500${movie.poster_path}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={movie.title || movie.name}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add('bg-zinc-800', 'flex', 'items-center', 'justify-center');
                    e.target.parentNode.innerHTML = '<span class="text-[10px] text-zinc-500">OFFLINE</span>';
                }}
            />

            {/* 2. HUD Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="glass-panel px-2 py-1 rounded-lg text-[10px] md:text-[12px] font-black text-neon-cyan flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> {movie.vote_average?.toFixed(1)}
                </div>
                <button
                    onClick={handleToggleList}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all ${inWatchlist
                        ? 'bg-neon-purple text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] border-none'
                        : 'bg-black/40 text-white border border-white/10 hover:bg-white/20'
                        }`}
                >
                    {inWatchlist ? <Check size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {/* 3. Cinematic Gradient & Info Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-4 md:p-6">
                <div className="space-y-3 transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-[11px] font-black text-neon-cyan uppercase tracking-wider">
                            {Math.round(movie.vote_average * 10)}% MATCH
                        </span>
                        <span className="h-1 w-1 bg-white/30 rounded-full" />
                        <span className="text-[10px] md:text-[11px] font-bold text-zinc-400">
                            {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}
                        </span>
                    </div>

                    <h4 className="text-sm md:text-base font-black text-white leading-tight uppercase italic line-clamp-2 tracking-tighter">
                        {movie.title || movie.name}
                    </h4>

                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSelectMedia({ ...movie, media_type: mediaType }); }}
                            className="flex-1 bg-white text-black py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-neon-cyan transition-all font-black text-[10px] uppercase"
                        >
                            <Play size={12} fill="black" />
                            <span>Play</span>
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onInfoClick({ ...movie, media_type: mediaType }); }}
                            className="glass-button p-2 rounded-xl border border-white/10"
                        >
                            <Info size={16} className="text-neon-cyan" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 4. Glass Border Glow (Only on hover) */}
            <div className="absolute inset-0 border-2 border-neon-cyan/0 group-hover:border-neon-cyan/20 rounded-inherit transition-colors duration-500 pointer-events-none" />
        </div>
    );
});

// --- THE MAIN ENGINE: Memoized Row ---
const Row = memo(({ title, fetchUrl, staticData, onSelectMedia, onInfoClick, user }) => {
    const [movies, setMovies] = useState(staticData || []);
    const rowRef = useRef(null);

    useEffect(() => {
        if (!fetchUrl) return;

        let isMounted = true;

        async function fetchData() {
            try {
                const { data } = await neuralFetch(`${fetchUrl}`);

                if (isMounted) {
                    // FIX: Add optional chaining (?.) to prevent crashes
                    setMovies(data.results?.filter(m => m.poster_path) || []);
                }
            } catch (error) {
                console.error("Error fetching row data:", error);
            }
        }
        fetchData();
        return () => { isMounted = false; };
    }, [fetchUrl]);

    const slide = (direction) => {
        if (!rowRef.current) return;
        const { scrollLeft, clientWidth } = rowRef.current;
        const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
        rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    };

    if (!movies || movies.length === 0) return null;

    return (
        <div className="group relative px-6 md:px-12 mb-12 md:mb-16">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-4 md:mb-8">
                <div className="flex items-center gap-3 md:gap-5">
                    <div className="h-6 md:h-10 w-1.5 bg-gradient-to-b from-neon-cyan to-transparent rounded-full" />
                    <h2 className="text-xl md:text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
                        {title}
                        {title.toLowerCase().includes('trending') && <Zap size={20} className="text-neon-cyan animate-pulse" />}
                    </h2>
                </div>

                {/* HUD Navigation Buttons */}
                <div className="hidden md:flex gap-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <button onClick={() => slide('left')} className="glass-button p-4 md:p-7 rounded-full hover:text-neon-cyan active:scale-90 border-2 border-white/10">
                        <ChevronLeft size={36} />
                    </button>
                    <button onClick={() => slide('right')} className="glass-button p-4 md:p-7 rounded-full hover:text-neon-cyan active:scale-90 border-2 border-white/10">
                        <ChevronRight size={36} />
                    </button>
                </div>
            </div>

            {/* Movie Slider */}
            <div
                ref={rowRef}
                className="flex gap-6 md:gap-10 overflow-x-auto no-scrollbar scroll-smooth py-6 px-4 snap-x"
            >
                {movies.map((movie) => (
                    <div key={movie.id} className="snap-start shrink-0">
                        <MovieTile
                            movie={movie}
                            user={user}
                            onSelectMedia={onSelectMedia}
                            onInfoClick={onInfoClick}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
});

export default Row;