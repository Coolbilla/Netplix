import React, { useState, useEffect, useRef } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import Row from '../components/Row';
import {
    Play, Info, Zap, Star, Calendar, ShieldCheck, Flame, X, Cpu, Shield,
    ChevronRight, ChevronLeft, MapPin, Film, Tv, History
} from 'lucide-react';




const Country = ({ user, handlePlay, onMoreInfo }) => {
    const [subView, setSubView] = useState('movies');
    const [heroSlides, setHeroSlides] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const carouselRef = useRef(null);
    const userRegion = user?.region || 'US';

    // 1. DYNAMIC DATA FETCH
    useEffect(() => {
        const fetchSectorHero = async () => {
            try {
                const endpoint = subView === 'movies'
                    ? `/discover/movie?region=${userRegion}&with_origin_country=${userRegion}&sort_by=popularity.desc`
                    : `/discover/tv?watch_region=${userRegion}&with_origin_country=${userRegion}&sort_by=popularity.desc`;

                const { data } = await neuralFetch(endpoint);
                setHeroSlides(data.results?.slice(0, 10)?.filter(m => m.backdrop_path) || []);
                setActiveIndex(0);
                if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: 'auto' });
            } catch (err) {
                console.error("Sector Fetch Error:", err);
            }
        };
        fetchSectorHero();
    }, [subView, userRegion]);

    // 2. AUTO-SWITCH ENGINE (6 Second Pulse)
    useEffect(() => {
        if (heroSlides.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => prev + 1);
        }, 6000);
        return () => clearInterval(interval);
    }, [heroSlides]);

    // 3. SEAMLESS LOOP ENGINE
    useEffect(() => {
        if (!carouselRef.current || heroSlides.length === 0) return;

        const container = carouselRef.current;
        const card = container.querySelector('.snap-center');

        if (card) {
            const cardWidth = card.offsetWidth + 40; // Card width + gap (gap-10 = 40px)

            // If we reach the "Cloned" slides at the end
            if (activeIndex === heroSlides.length) {
                container.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });

                // Invisible jump back to index 0 after smooth scroll finishes
                const timer = setTimeout(() => {
                    container.scrollTo({ left: 0, behavior: 'auto' });
                    setActiveIndex(0);
                }, 700); // Match this to your CSS transition speed
                return () => clearTimeout(timer);
            } else {
                container.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });
            }
        }
    }, [activeIndex, heroSlides.length]);

    const scrollCarousel = (direction) => {
        if (direction === 'left') {
            setActiveIndex((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
        } else {
            setActiveIndex((prev) => prev + 1);
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-[#020617] relative overflow-x-hidden">
            {/* --- SECTOR IDENTITY HUD --- */}
            <div className="relative z-50 pt-32 flex flex-col items-center text-center px-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className={`h-px w-12 ${subView === 'movies' ? 'bg-cyan-500 shadow-neon' : 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]'}`} />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white italic">
                        Neural Uplink: {userRegion}
                    </h3>
                    <div className={`h-px w-12 ${subView === 'movies' ? 'bg-cyan-500 shadow-neon' : 'bg-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.5)]'}`} />
                </div>

                <h1 className="text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-8">
                    {subView === 'movies' ? 'Local Cinema' : 'Local Broadcast'}
                </h1>

                {/* SUB-PAGE SELECTOR */}
                <div className="flex items-center gap-1 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                    <button onClick={() => setSubView('movies')} className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${subView === 'movies' ? 'bg-cyan-500 text-black shadow-neon scale-105' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                        <Film size={16} /> Cinematic Sector
                    </button>
                    <button onClick={() => setSubView('tv')} className={`flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${subView === 'tv' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.5)] scale-105' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                        <Tv size={16} /> Broadcast Sector
                    </button>
                </div>
            </div>

            {/* HERO BANNER WITH CLONED SLIDES FOR LOOP */}
            {heroSlides.length > 0 && (
                <header className="relative w-full pt-10 pb-10 overflow-hidden group/hero">
                    <button onClick={() => scrollCarousel('left')} className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-cyan-500 hover:text-black">
                        <ChevronLeft size={32} />
                    </button>
                    <button onClick={() => scrollCarousel('right')} className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-cyan-500 hover:text-black">
                        <ChevronRight size={32} />
                    </button>

                    <div ref={carouselRef} className="flex gap-10 overflow-x-auto no-scrollbar snap-x snap-mandatory px-6 md:px-[15%] relative z-30">
                        {/* Render Original Slides + 3 Clones at the end for the loop effect */}
                        {[...heroSlides, ...heroSlides.slice(0, 3)].map((m, idx) => (
                            <div key={`${m.id}-${idx}`} className={`snap-center shrink-0 w-[85vw] md:w-[70vw] relative transition-all duration-700 ${idx % heroSlides.length === activeIndex % heroSlides.length ? 'opacity-100 scale-100' : 'opacity-20 scale-90 blur-sm'}`}>
                                <div className={`relative rounded-[2.5rem] overflow-hidden border transition-all duration-700 ${subView === 'movies' ? 'border-cyan-500/20 shadow-cyan-500/10' : 'border-purple-500/20 shadow-purple-500/10'} bg-black shadow-2xl`}>

                                    {/* Aspect Ratio Box */}
                                    <div className="relative aspect-[21/9] md:aspect-[21/8] overflow-hidden">
                                        <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${m.backdrop_path}`} className="w-full h-full object-cover opacity-80" alt="" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                        <div className="absolute top-6 left-6 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${subView === 'movies' ? 'border-cyan-500 text-cyan-500 shadow-neon' : 'border-purple-500 text-purple-500 shadow-purple-500/50'}`}>
                                                <MapPin size={20} />
                                            </div>
                                            <span className={`text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] ${subView === 'movies' ? 'text-cyan-500' : 'text-purple-500'}`}>Sector_{userRegion}</span>
                                        </div>
                                    </div>

                                    {/* Info HUD */}
                                    <div className="relative p-6 md:p-12 bg-black/80 backdrop-blur-3xl border-t border-white/5">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                            <div className="flex-1">
                                                <h2 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 line-clamp-1">
                                                    {m.name || m.title}
                                                </h2>
                                                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed line-clamp-2 max-w-2xl font-medium opacity-80 italic">
                                                    {m.overview}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 shrink-0">
                                                <button onClick={() => handlePlay(m)} className={`px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-neon ${subView === 'movies' ? 'bg-cyan-500 text-black hover:bg-white' : 'bg-purple-600 text-white hover:bg-white hover:text-black'}`}>
                                                    <Play fill="currentColor" size={20} /> Initialize Link
                                                </button>
                                                <button onClick={() => onMoreInfo(m)} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all">
                                                    <Info size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DYNAMIC DOTS */}
                    <div className="flex justify-center gap-2 mt-10">
                        {heroSlides.map((_, i) => (
                            <button key={i} onClick={() => setActiveIndex(i)} className={`h-1 rounded-full transition-all duration-500 ${activeIndex % heroSlides.length === i ? (subView === 'movies' ? 'w-12 bg-cyan-500' : 'w-12 bg-purple-500') : 'w-6 bg-zinc-800'}`} />
                        ))}
                    </div>
                </header>
            )}

            <main className="relative z-40 -mt-10 pb-20 space-y-24">

                {/* --- SECTION 1: THE POWER GRID (TOP 10) --- */}
                <section className="px-6 md:px-12">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                        <h2 className="text-xl font-black italic text-white uppercase tracking-[0.3em] flex items-center gap-3">
                            <Star className="text-cyan-500" size={20} fill="currentColor" />
                            Sector Top 10
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
                    </div>
                    <Row
                        title=""
                        fetchUrl={subView === 'movies'
                            ? `/discover/movie?region=${userRegion}&with_origin_country=${userRegion}&sort_by=vote_count.desc`
                            : `/discover/tv?watch_region=${userRegion}&with_origin_country=${userRegion}&sort_by=vote_count.desc`
                        }
                        onSelectMedia={handlePlay}
                        onInfoClick={onMoreInfo}
                        user={user}
                        isLarge={true} // If your Row component supports a "Top 10" style
                    />
                </section>

                {/* --- SECTION 2: RECENT UPLINKS (LATEST) --- */}
                <Row
                    title={`Latest in Sector ${userRegion}`}
                    fetchUrl={subView === 'movies'
                        ? `/discover/movie?region=${userRegion}&with_origin_country=${userRegion}&primary_release_date.gte=2024-01-01&sort_by=primary_release_date.desc`
                        : `/discover/tv?watch_region=${userRegion}&with_origin_country=${userRegion}&first_air_date.gte=2024-01-01&sort_by=first_air_date.desc`
                    }
                    onSelectMedia={handlePlay}
                    onInfoClick={onMoreInfo}
                    user={user}
                />

                {/* --- SECTION 3: GENRE SCANNER --- */}
                {/* This dynamically maps through genres based on whether you're in Movie or TV mode */}
                {(subView === 'movies' ? MOVIE_GENRES : TV_GENRES).slice(0, 5).map((genre) => (
                    <Row
                        key={genre.id}
                        title={`${genre.name} // ${userRegion}`}
                        fetchUrl={subView === 'movies'
                            ? `/discover/movie?with_genres=${genre.id}&region=${userRegion}&with_origin_country=${userRegion}`
                            : `/discover/tv?with_genres=${genre.id}&watch_region=${userRegion}&with_origin_country=${userRegion}`
                        }
                        onSelectMedia={handlePlay}
                        onInfoClick={onMoreInfo}
                        user={user}
                    />
                ))}

                {/* --- SECTION 4: OLD IS GOLD (CLASSICS) --- */}
                <div className="relative pt-10">
                    {/* Visual Break for "Classics" */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent pointer-events-none" />

                    <div className="px-6 md:px-12 mb-8">
                        <h3 className="text-2xl font-black text-orange-500 uppercase italic tracking-tighter flex items-center gap-4">
                            <span className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                                <History size={24} />
                            </span>
                            Old is Gold: {userRegion} Heritage
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] mt-2">Accessing Legacy Datastreams // Pre-2000 Archive</p>
                    </div>

                    <Row
                        title=""
                        fetchUrl={subView === 'movies'
                            ? `/discover/movie?region=${userRegion}&with_origin_country=${userRegion}&primary_release_date.lte=1998-01-01&sort_by=popularity.desc`
                            : `/discover/tv?watch_region=${userRegion}&with_origin_country=${userRegion}&first_air_date.lte=1998-01-01&sort_by=popularity.desc`
                        }
                        onSelectMedia={handlePlay}
                        onInfoClick={onMoreInfo}
                        user={user}
                    />
                </div>
            </main>
        </div>
    );
};

const MOVIE_GENRES = [
    { id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' },
    { id: 27, name: 'Horror' }, { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' }
];

const TV_GENRES = [
    { id: 10759, name: 'Action & Adventure' }, { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' }, { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 9648, name: 'Mystery' }
];

export default Country;