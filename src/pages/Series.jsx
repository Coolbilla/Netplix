import React, { useState, useEffect, useRef } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import Row from '../components/Row';
import { Play, Info, Star, Calendar, Monitor, Tv, X, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';




const TV_GENRES = [
    { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' }, { id: 10762, name: 'Kids' }, { id: 9648, name: 'Mystery' },
    { id: 10763, name: 'News' }, { id: 10764, name: 'Reality' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' }, { id: 10767, name: 'Talk' }, { id: 10768, name: 'War & Politics' },
    { id: 37, name: 'Western' }
];

const Series = ({ user, handlePlay, onMoreInfo, continueWatching, onRemoveFromHistory }) => {
    const [heroSlides, setHeroSlides] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    // Filter: Only show TV Shows in this history row (excluding Anime)
    const seriesHistory = continueWatching?.filter(m => m.media_type === 'tv' && !m.isAnime) || [];

    useEffect(() => {
        const fetchHeroes = async () => {
            try {
                const { data } = await neuralFetch(`/tv/popular`);
                // Take top 10 tv shows for the carousel
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

            if (activeIndex === heroSlides.length) {
                container.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });
                const timer = setTimeout(() => {
                    container.scrollTo({ left: 0, behavior: 'auto' });
                    setActiveIndex(0);
                }, 700);
                return () => clearTimeout(timer);
            } else {
                container.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });
            }
        }
    }, [activeIndex, heroSlides.length]);

    const scrollCarousel = (direction) => {
        if (direction === 'left') {
            setActiveIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
        } else {
            setActiveIndex((prev) => prev + 1);
        }
    };

    // --- MARK 2: DYNAMIC ALGORITHM ---
    const userPrefs = user?.preferences || [];
    const preferredGenres = TV_GENRES.filter(g =>
        userPrefs.some(pref => g.name.includes(pref) || (pref === 'Sci-Fi' && g.name.includes('Sci-Fi')))
    );
    const otherGenres = TV_GENRES.filter(g => !preferredGenres.includes(g));
    const dynamicRows = [...preferredGenres, ...otherGenres];

    return (
        <div className="min-h-screen pb-20 bg-[#020202] relative overflow-x-hidden selection:bg-purple-500/30">
            {/* SERIES ATMOSPHERIC GLOWS */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* --- ELITE STAGE CAROUSEL (SERIES EDITION) --- */}
            {heroSlides.length > 0 && (
                <header className="relative w-full pt-24 md:pt-32 pb-10 overflow-hidden group/hero">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 to-transparent z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent z-10" />
                    </div>

                    <button
                        onClick={() => scrollCarousel('left')}
                        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-neon-purple hover:scale-110"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={() => scrollCarousel('right')}
                        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-neon-purple hover:scale-110"
                    >
                        <ChevronRight size={32} />
                    </button>

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
                                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl transition-all duration-700 focus-within:border-neon-purple/50 focus-within:shadow-[0_0_50px_rgba(168,85,247,0.25)] group-hover:border-neon-purple/30 group-hover:shadow-[0_0_50px_rgba(168,85,247,0.15)]">

                                    <div className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden">
                                        <img
                                            src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${m.backdrop_path}`}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            alt=""
                                        />
                                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20 opacity-20" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                                        <div className="absolute top-6 left-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neon-purple flex items-center justify-center shadow-neon-purple">
                                                <Tv size={20} className="text-white" />
                                            </div>
                                            <span className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">Aether Stream</span>
                                        </div>
                                    </div>

                                    <div className="relative p-6 md:p-12 bg-[#0a0a0a]/80 backdrop-blur-3xl border-t border-white/5">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4 text-[10px] font-black text-neon-purple uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Star size={14} fill="currentColor" /> {m.vote_average?.toFixed(1)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span>{m.first_air_date?.split('-')[0]}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span className="text-white/40">Digital Transverse</span>
                                                </div>
                                                <h2 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 group-hover:text-neon-purple transition-colors line-clamp-1">
                                                    {m.name}
                                                </h2>
                                                <p className="text-zinc-400 text-xs md:text-base leading-relaxed line-clamp-2 max-w-2xl italic opacity-80">
                                                    {m.overview}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                                                <button
                                                    onClick={() => handlePlay(m)}
                                                    tabIndex="0"
                                                    className="bg-neon-purple text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-purple-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-neon-purple focus:outline-none"
                                                >
                                                    <Play fill="currentColor" size={20} /> Initialize
                                                </button>
                                                <button
                                                    onClick={() => onMoreInfo(m)}
                                                    tabIndex="0"
                                                    className="glass-panel text-white p-4 md:p-5 rounded-2xl border-white/10 hover:border-neon-purple/50 focus:outline-none focus:border-neon-purple transition-all hover:scale-105"
                                                >
                                                    <Info size={24} className="text-neon-purple" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-purple/5 blur-3xl pointer-events-none" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center gap-2 mt-10">
                        {heroSlides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className={`h-1 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-12 bg-neon-purple shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'w-6 bg-zinc-800 hover:bg-zinc-700'}`}
                            />
                        ))}
                    </div>
                </header>
            )}

            <main className="relative z-40 -mt-10 md:-mt-20 space-y-12">
                {/* --- SERIES RESUME ROW --- */}
                {seriesHistory.length > 0 && (
                    <div className="px-6 md:px-12">
                        <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 mb-6">
                            <span>Continue Binging</span>
                            <div className="h-1 w-1 rounded-full bg-neon-purple shadow-neon-purple" />
                            <span className="text-[10px] font-black text-neon-purple uppercase tracking-[0.2em] opacity-80">Syncing Feed</span>
                        </h3>
                        <div className="relative p-6 md:p-8 rounded-[3rem] border border-neon-purple/20 bg-neon-purple/[0.01] shadow-[inset_0_0_60px_rgba(168,85,247,0.03)] backdrop-blur-[2px] transition-all duration-700 hover:border-neon-purple/40">
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-neon-purple/30 rounded-tl-[3rem] pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-neon-purple/30 rounded-br-[3rem] pointer-events-none" />
                            <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 px-2 snap-x">
                                {seriesHistory.map((m) => (
                                    <div key={m.id} className="snap-start w-[150px] md:w-[220px] shrink-0 group cursor-pointer relative" onClick={() => onMoreInfo(m)}>
                                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-neon-purple/20 bg-[#0a0a0a] shadow-lg transition-all duration-500 group-hover:scale-[1.05] group-hover:border-neon-purple/50">
                                            <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover" alt="" loading="lazy" />

                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-12 h-12 rounded-full bg-neon-purple flex items-center justify-center shadow-lg">
                                                    <Info size={20} className="text-white" />
                                                </div>
                                            </div>

                                            <button onClick={(e) => { e.stopPropagation(); onRemoveFromHistory(m.id); }} className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-black/40 text-white/40 hover:bg-red-600 transition-all font-bold"><X size={14} /></button>

                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-neon-purple to-purple-400 w-[65%]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <Row title="Trending TV Series" fetchUrl="/trending/tv/day" onSelectMedia={handlePlay} onInfoClick={onMoreInfo} user={user} />

                {dynamicRows.map((genre) => {
                    const isFavorite = preferredGenres.includes(genre);
                    return (
                        <Row
                            key={genre.id}
                            title={isFavorite ? `★ Top Series Picks in ${genre.name}` : `${genre.name} Series`}
                            fetchUrl={`/discover/tv?with_genres=${genre.id}`}
                            user={user}
                            onSelectMedia={handlePlay}
                            onInfoClick={onMoreInfo}
                        />
                    );
                })}
            </main>
        </div>
    );
};

export default Series;