import React, { useState, useEffect, useRef } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import Row from '../components/Row';
import { Play, Info, Star, Calendar, ShieldCheck, Film, X, ChevronRight, ChevronLeft } from 'lucide-react';




const MOVIE_GENRES = [
    { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' }
];


const Movies = ({ user, handlePlay, onMoreInfo, continueWatching, onRemoveFromHistory }) => {
    // --- MARK 2: THE DYNAMIC ROW ALGORITHM ---
    const userPrefs = user?.preferences || [];
    const preferredGenres = MOVIE_GENRES.filter(g => userPrefs.includes(g.name));
    const otherGenres = MOVIE_GENRES.filter(g => !userPrefs.includes(g.name));
    const dynamicRows = [...preferredGenres, ...otherGenres];

    const [heroSlides, setHeroSlides] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    // Filter: Only show Movies in this history row
    const movieHistory = continueWatching?.filter(m => m.media_type === 'movie') || [];

    useEffect(() => {
        const fetchHeroes = async () => {
            try {
                const { data } = await neuralFetch(`/movie/popular`);
                // Take top 10 movies for the carousel
                setHeroSlides(data.results?.slice(0, 10)?.filter(m => m.backdrop_path) || []);
            } catch (err) { console.error(err); }
        };
        fetchHeroes();
    }, []);

    // AUTO-SCROLL ENGINE
    useEffect(() => {
        if (heroSlides.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => prev + 1);
        }, 6000); // 6 second interval
        return () => clearInterval(interval);
    }, [heroSlides]);

    // SYNC SCROLL POSITION & SEAMLESS WRAP
    useEffect(() => {
        if (!carouselRef.current || heroSlides.length === 0) return;
        const container = carouselRef.current;
        const card = container.querySelector('.snap-center');

        if (card) {
            const cardWidth = card.offsetWidth + 40;

            // Handle Seamless Jump: If we are at the clone (index == length), 
            // wait for the smooth scroll to finish, then snap back to index 0.
            if (activeIndex === heroSlides.length) {
                // First, scroll to the clone smoothly
                container.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });

                // Then, after animation, jump to index 0 silently
                const timer = setTimeout(() => {
                    container.scrollTo({ left: 0, behavior: 'auto' });
                    setActiveIndex(0);
                }, 700); // Approx duration of 'smooth' behavior
                return () => clearTimeout(timer);
            } else {
                // Normal smooth scroll for all other indices
                container.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });
            }
        }
    }, [activeIndex, heroSlides.length]);

    const scrollCarousel = (direction) => {
        if (direction === 'left') {
            // For left, if we are at start, go to actual last then smooth to fake last? 
            // Simpler: just wrap around normally for manual left.
            setActiveIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
        } else {
            setActiveIndex((prev) => prev + 1);
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-[#020202] relative overflow-x-hidden selection:bg-red-500/30">
            {/* ATMOSPHERIC GLOWS */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* --- ELITE STAGE CAROUSEL --- */}
            {heroSlides.length > 0 && (
                <header className="relative w-full pt-24 md:pt-32 pb-10 overflow-hidden group/hero">
                    {/* Background Ambient Engine */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-red-600/5 to-transparent z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent z-10" />
                    </div>

                    {/* Navigation Guards */}
                    <button
                        onClick={() => scrollCarousel('left')}
                        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={() => scrollCarousel('right')}
                        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* Carousel Strip */}
                    <div
                        ref={carouselRef}
                        className="flex gap-6 md:gap-10 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 md:px-[15%] relative z-30"
                    >
                        {[...heroSlides, ...heroSlides.slice(0, 3)].map((m, idx) => (
                            <div
                                key={`${m.id}-${idx}`}
                                tabIndex="0"
                                onFocus={() => setActiveIndex(idx % heroSlides.length)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handlePlay(m);
                                    if (e.key === 'ArrowRight') scrollCarousel('right');
                                    if (e.key === 'ArrowLeft') scrollCarousel('left');
                                }}
                                className="snap-center shrink-0 w-[85vw] md:w-[70vw] relative group cursor-default focus:outline-none"
                            >
                                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl transition-all duration-700 focus-within:border-red-600/50 focus-within:shadow-[0_0_50px_rgba(220,38,38,0.25)] group-hover:border-red-600/30 group-hover:shadow-[0_0_50px_rgba(220,38,38,0.15)]">

                                    {/* Top Section: Backdrop */}
                                    <div className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden">
                                        <img
                                            src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${m.backdrop_path}`}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            alt=""
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                                        {/* Hub Badge */}
                                        <div className="absolute top-6 left-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                                <Film size={20} className="text-white" />
                                            </div>
                                            <span className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">Cinema Premiere</span>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Media Data Engine */}
                                    <div className="relative p-6 md:p-12 bg-[#0a0a0a]/80 backdrop-blur-3xl border-t border-white/5">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4 text-[10px] font-black text-red-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Star size={14} fill="currentColor" /> {m.vote_average?.toFixed(1)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span>{m.release_date?.split('-')[0]}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span className="text-white/40">Ultra HD 4K</span>
                                                </div>
                                                <h2 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 group-hover:text-red-600 transition-colors line-clamp-1">
                                                    {m.title}
                                                </h2>
                                                <p className="text-zinc-400 text-xs md:text-base leading-relaxed line-clamp-2 max-w-2xl italic opacity-80">
                                                    {m.overview}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                                                <button
                                                    onClick={() => handlePlay(m)}
                                                    tabIndex="0"
                                                    className="bg-red-600 text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-red-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-neon-red focus:outline-none"
                                                >
                                                    <Play fill="currentColor" size={20} /> Initialize
                                                </button>
                                                <button
                                                    onClick={() => onMoreInfo(m)}
                                                    tabIndex="0"
                                                    className="glass-panel text-white p-4 md:p-5 rounded-2xl border-white/10 hover:border-red-600/50 focus:outline-none focus:border-red-600 transition-all hover:scale-105"
                                                >
                                                    <Info size={24} className="text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Perspective Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/5 blur-3xl pointer-events-none" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Indicators */}
                    <div className="flex justify-center gap-2 mt-10">
                        {heroSlides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`h-1 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-12 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'w-6 bg-zinc-800 hover:bg-zinc-700'}`}
                            />
                        ))}
                    </div>
                </header>
            )}

            <main className="relative z-40 -mt-10 md:-mt-20 space-y-12">
                {/* --- CINEMA RESUME ROW --- */}
                {movieHistory.length > 0 && (
                    <div className="px-6 md:px-12">
                        <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 mb-6">
                            <span>Resume Movie</span>
                            <div className="h-1 w-1 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] opacity-80">Theater Mode</span>
                        </h3>
                        <div className="relative p-6 md:p-8 rounded-[3rem] border border-red-600/20 bg-red-600/[0.01] shadow-[inset_0_0_60px_rgba(220,38,38,0.03)] backdrop-blur-[2px] transition-all duration-700 hover:border-red-600/40">
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-red-600/30 rounded-tl-[3rem] pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-red-600/30 rounded-br-[3rem] pointer-events-none" />
                            <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 px-2 snap-x">
                                {movieHistory.map((m) => (
                                    <div key={m.id} className="snap-start w-[150px] md:w-[220px] shrink-0 group cursor-pointer relative" onClick={() => onMoreInfo(m)}>
                                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-red-600/20 bg-[#0a0a0a] shadow-lg transition-all duration-500 group-hover:scale-[1.05] group-hover:border-red-600/50">
                                            <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover" alt="" loading="lazy" />

                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                                                    <Info size={20} className="text-white" />
                                                </div>
                                            </div>

                                            <button onClick={(e) => { e.stopPropagation(); onRemoveFromHistory(m.id); }} className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-black/40 text-white/40 hover:bg-red-600 transition-all font-bold"><X size={14} /></button>

                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 w-[65%]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-14 relative z-20">
                    <Row title="Trending Movies" fetchUrl="/trending/movie/week" user={user} onSelectMedia={handlePlay} onInfoClick={onMoreInfo} />

                    {dynamicRows.map((genre) => {
                        const isFavorite = userPrefs.includes(genre.name);
                        return (
                            <Row
                                key={genre.id}
                                title={isFavorite ? `★ Top Movie Picks in ${genre.name}` : `${genre.name} Movies`}
                                fetchUrl={`/discover/movie?with_genres=${genre.id}`} // Locks to Movies
                                user={user}
                                onSelectMedia={handlePlay}
                                onInfoClick={onMoreInfo}
                            />
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default Movies;
