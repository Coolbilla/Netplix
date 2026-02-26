import React, { useState, useEffect, useRef } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import Row from '../components/Row';
import StudioHub from '../components/StudioHub';
import DiscoveryFeed from '../components/DiscoveryFeed';
import {
    Play, Info, Users, Zap, ShieldCheck, X,
    Trophy, Globe, ChevronLeft, ChevronRight, Search, Star, Calendar
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const TMDB_GENRES = {
    "Action": 28, "Adventure": 12, "Animation": 16, "Anime": 16,
    "Comedy": 35, "Crime": 80, "Documentary": 99, "Drama": 18,
    "Family": 10751, "Fantasy": 14, "History": 36, "Horror": 27,
    "Music": 10402, "Mystery": 9648, "Romance": 10749, "Sci-Fi": 878,
    "Thriller": 53, "Western": 37
};

const ALL_GENRES = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Sci-Fi' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
];



// --- COMPONENT: "BECAUSE YOU WATCHED" ---
const BecauseYouWatched = ({ historyItem, onMoreInfo }) => {
    const [recs, setRecs] = useState([]);

    useEffect(() => {
        if (!historyItem || !historyItem.id) return;
        const fetchRecs = async () => {
            try {
                let type = historyItem.media_type || (historyItem.first_air_date ? 'tv' : 'movie');
                let url = `/${type}/${historyItem.id}/recommendations?language=en-US&page=1`;
                const { data } = await neuralFetch(url);
                // FIX: Add optional chaining (?.) to prevent crashes
                setRecs(data.results?.filter(item => item.poster_path).slice(0, 10) || []);
            } catch (err) { console.error("Recs error:", err); }
        };
        fetchRecs();
    }, [historyItem]);

    if (recs.length === 0) return null;

    return (
        <div className="mb-10 pl-6 md:pl-12 relative z-20">
            <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2 text-white">
                <Zap size={20} className="text-neon-cyan" />
                Because you watched <span className="italic text-neon-cyan">{historyItem.title || historyItem.name}</span>
            </h2>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 pr-6 snap-x">
                {recs.map((item) => (
                    <div key={item.id} onClick={() => onMoreInfo(item)} className="snap-start poster-hover shrink-0 w-36 md:w-48 aspect-[2/3] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-neon-cyan/50 transition-all shadow-lg bg-zinc-900">
                        <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${item.poster_path}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                ))}
            </div>
        </div>
    );
};



// --- MAIN HOME COMPONENT ---
const Home = ({ handlePlay, user, continueWatching, onMoreInfo, onJoinParty, setCurrentPage, onRemoveFromHistory }) => {
    // --- MARK 2: THE DYNAMIC 20-ROW ALGORITHM ---
    const userPrefs = user?.preferences || [];

    // 1. Pull the user's selected genres from Firebase
    const preferredGenres = ALL_GENRES.filter(g => userPrefs.includes(g.name));

    // 2. Grab all the genres they DIDN'T select
    const otherGenres = ALL_GENRES.filter(g => !userPrefs.includes(g.name));

    // 3. Combine them: Favorites at the top, the rest underneath
    const dynamicRows = [...preferredGenres, ...otherGenres];

    const [heroSlides, setHeroSlides] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [top10, setTop10] = useState([]);
    const [publicParties, setPublicParties] = useState([]);
    const carouselRef = useRef(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                // Fetch Global Trending for the Carousel and Top 10 list
                const trendingRes = await neuralFetch(`/trending/all/day`);
                setHeroSlides(trendingRes.data.results?.slice(0, 10)?.filter(m => m.backdrop_path) || []);
                setTop10(trendingRes.data.results?.slice(0, 10) || []);
            } catch (err) { console.error("Home Data Fetch Error:", err); }
        };

        fetchHomeData();

        // Listen for active Watch Parties
        const q = query(collection(db, "parties"), where("settings.isPublic", "==", true));
        const unsub = onSnapshot(q, (snapshot) => setPublicParties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
        return () => unsub();
    }, []);

    // AUTO-SCROLL ENGINE
    useEffect(() => {
        if (heroSlides.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => prev + 1);
        }, 6000);
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

    const relevantHistoryItem = user?.history?.[0];

    return (
        <div className="min-h-screen pb-20 bg-[#020617] relative overflow-x-hidden">
            <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none z-0" />
            <div className="absolute bottom-0 left-[-5%] w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none z-0" />

            {/* 1. Elite Stage Carousel Hero */}
            {heroSlides.length > 0 && (
                <header className="relative w-full pt-24 md:pt-32 pb-10 overflow-hidden group/hero">
                    {/* Background Ambient Engine */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-neon-cyan/5 to-transparent z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/50 to-transparent z-10" />
                    </div>

                    {/* Navigation Guards */}
                    <button
                        onClick={() => scrollCarousel('left')}
                        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-neon-cyan hover:scale-110"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={() => scrollCarousel('right')}
                        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover/hero:opacity-100 transition-all hover:bg-neon-cyan hover:scale-110"
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
                                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl transition-all duration-700 focus-within:border-neon-cyan/50 focus-within:shadow-[0_0_50px_rgba(34,211,238,0.25)] group-hover:border-neon-cyan/30 group-hover:shadow-[0_0_50px_rgba(34,211,238,0.15)]">

                                    {/* Top Section: Backdrop */}
                                    <div className="relative aspect-[16/9] md:aspect-[21/8] overflow-hidden">
                                        <img
                                            src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${m.backdrop_path}`}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                            alt=""
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                                        {/* Hub Badge */}
                                        <div className="absolute top-6 left-6 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neon-cyan flex items-center justify-center shadow-neon">
                                                <Zap size={20} className="text-black" />
                                            </div>
                                            <span className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-[0.3em] drop-shadow-md">Prime Featured</span>
                                        </div>
                                    </div>

                                    {/* Bottom Section: Media Data Engine */}
                                    <div className="relative p-6 md:p-12 bg-[#0a0a0a]/80 backdrop-blur-3xl border-t border-white/5">
                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4 text-[10px] font-black text-neon-cyan uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Star size={14} fill="currentColor" /> {m.vote_average?.toFixed(1)}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span>{(m.release_date || m.first_air_date)?.split('-')[0]}</span>
                                                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                                    <span className="text-white/40">Ultra HD 4K</span>
                                                </div>
                                                <h2 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-4 group-hover:text-neon-cyan transition-colors line-clamp-1">
                                                    {m.title || m.name}
                                                </h2>
                                                <p className="text-zinc-400 text-xs md:text-base leading-relaxed line-clamp-2 max-w-2xl italic opacity-80">
                                                    {m.overview}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0">
                                                <button
                                                    onClick={() => handlePlay(m)}
                                                    className="bg-white text-black px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-neon-cyan hover:scale-105 transition-all flex items-center gap-3 shadow-2xl focus:outline-none"
                                                >
                                                    <Play fill="currentColor" size={20} /> Initialize
                                                </button>
                                                <button
                                                    onClick={() => onMoreInfo(m)}
                                                    className="glass-panel text-white p-4 md:p-5 rounded-2xl border-white/10 hover:border-neon-cyan/50 transition-all"
                                                >
                                                    <Info size={24} className="text-neon-cyan" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Perspective Accents */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-cyan/5 blur-3xl pointer-events-none" />
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
                                className={`h-1 rounded-full transition-all duration-500 ${activeIndex === i ? 'w-12 bg-neon-cyan shadow-neon' : 'w-6 bg-zinc-800 hover:bg-zinc-700'}`}
                            />
                        ))}
                    </div>
                </header>
            )}

            {/* 3. Main Content Stack */}
            <main className="relative z-30 pt-10 space-y-14">

                <StudioHub onSelect={(id) => setCurrentPage(id)} />

                {publicParties.length > 0 && (
                    <div className="px-6 md:px-12">
                        <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-3">
                            Live Watch Parties <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
                        </h3>
                        <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 snap-x">
                            {publicParties.map((party) => (
                                <div key={party.id} onClick={() => onJoinParty(party.id)} className="snap-start min-w-[280px] md:min-w-[300px] glass-panel p-4 rounded-xl border border-white/5 hover:border-neon-cyan/50 transition-all cursor-pointer flex gap-4 items-center">
                                    <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w200${party.media.poster}`} className="w-16 aspect-[2/3] rounded-lg object-cover shadow-lg" alt="" loading="lazy" />
                                    <div className="flex-1 min-w-0 text-white">
                                        <h4 className="font-bold truncate text-sm uppercase tracking-tight">{party.media.title}</h4>
                                        <p className="text-[10px] text-zinc-500 uppercase mt-1">Host: {party.hostName}</p>
                                        <span className="text-[10px] font-black text-neon-cyan uppercase mt-3 block">{party.members?.length || 1} Watching Now</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {continueWatching?.length > 0 && (
                    <div className="px-6 md:px-12">
                        <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-3 mb-8">
                            <span>Continue Watching</span>
                            <div className="h-1 w-1 rounded-full bg-[#00FFFF]" />
                            <span className="text-[10px] font-black text-[#00FFFF] uppercase tracking-[0.2em] opacity-80">Resume session</span>
                        </h3>
                        <div className="relative p-6 md:p-8 rounded-[3rem] border border-[#00FFFF]/20 bg-[#00FFFF]/[0.01] shadow-[inset_0_0_60px_rgba(0,255,255,0.03)] backdrop-blur-[2px] transition-all duration-700 hover:border-[#00FFFF]/40">
                            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#00FFFF]/30 rounded-tl-[3rem] pointer-events-none" />
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#00FFFF]/30 rounded-br-[3rem] pointer-events-none" />
                            <div className="flex gap-6 overflow-x-auto no-scrollbar py-2 px-2 snap-x">
                                {continueWatching.map((m) => (
                                    <div key={m.id} className="snap-start w-[150px] md:w-[220px] shrink-0 group cursor-pointer relative" onClick={() => onMoreInfo(m)}>
                                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-[#00FFFF]/20 bg-[#0a0a0a] shadow-lg transition-all duration-500 group-hover:scale-[1.05] group-hover:border-[#00FFFF]/50">
                                            <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover" alt="" loading="lazy" />
                                            <button onClick={(e) => { e.stopPropagation(); onRemoveFromHistory(m.id); }} className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-black/40 text-white/40 hover:bg-red-600/80 opacity-0 group-hover:opacity-100 transition-all font-bold"><X size={14} /></button>
                                            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
                                                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-[#00FFFF] to-neon-purple w-[65%]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <DiscoveryFeed user={user} handlePlay={handlePlay} onMoreInfo={onMoreInfo} />

                <div className="space-y-4">
                    {relevantHistoryItem && <BecauseYouWatched historyItem={relevantHistoryItem} onMoreInfo={onMoreInfo} />}
                </div>

                {top10.length > 0 && (
                    <div className="px-6 md:px-12 relative z-20">
                        <div className="flex items-center gap-3 mb-6 opacity-60">
                            <div className="h-px w-8 bg-neon-cyan" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Global Top Rank</h3>
                        </div>
                        <div className="flex gap-14 md:gap-20 overflow-x-auto no-scrollbar py-12 px-10 snap-x">
                            {top10.map((m, index) => (
                                <div key={m.id} className="snap-start relative min-w-[200px] md:min-w-[260px] h-[300px] md:h-[400px] flex items-end group cursor-pointer" onClick={() => onMoreInfo(m)}>
                                    <span className="absolute -left-12 bottom-[-20px] text-[200px] md:text-[280px] font-black italic select-none text-transparent opacity-50 group-hover:opacity-80 transition-all pointer-events-none" style={{ WebkitTextStroke: '4px rgba(255,255,255,0.7)', fontFamily: '"Archivo Black", sans-serif' }}>{index + 1}</span>
                                    <div className="relative z-10 w-full h-full ml-10 overflow-hidden rounded-2xl border border-white/5 transition-all group-hover:scale-105 group-hover:-translate-y-6 group-hover:border-neon-cyan/40 bg-zinc-900">
                                        <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover" alt="" loading="lazy" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* THE BUFFET ROWS (Mark 2 Dynamic 20-Row Feed) */}
                <div className="space-y-14 relative z-20">

                    {/* Keep your top two essential rows */}
                    <Row title="Trending Worldwide" fetchUrl="/trending/all/day" user={user} onSelectMedia={handlePlay} onInfoClick={onMoreInfo} />
                    <Row title="Binge-Worthy TV" fetchUrl="/tv/popular" user={user} onSelectMedia={handlePlay} onInfoClick={onMoreInfo} />
                    <Row title="Anime Hub" fetchUrl="/discover/tv?with_genres=16&with_original_language=ja" user={user} onSelectMedia={handlePlay} onInfoClick={onMoreInfo} />

                    {/* Automatically generate the remaining 18+ rows based on Firebase Preferences */}
                    {dynamicRows.map((genre) => {
                        // Check if this row is one of their Firebase favorites
                        const isFavorite = userPrefs.includes(genre.name);

                        return (
                            <Row
                                key={genre.id}
                                // Make the title pop if it's a favorite
                                title={isFavorite ? `★ Top Picks in ${genre.name}` : `${genre.name} Hits`}
                                fetchUrl={`/discover/movie?with_genres=${genre.id}`}
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

export default Home;