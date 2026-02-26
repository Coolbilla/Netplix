import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Star, Calendar, ShieldCheck, ChevronRight, ChevronLeft, Zap } from 'lucide-react';

const TVCarouselHero = ({ slides, onPlay, onInfo, themeColor = "neon-cyan" }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    // Auto-Scroll Logic
    useEffect(() => {
        if (!slides || slides.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex((prev) => prev + 1);
        }, 8000); // 8 seconds for TV readability
        return () => clearInterval(interval);
    }, [slides]);

    // Smooth Scroll Sync
    useEffect(() => {
        if (!carouselRef.current || !slides || slides.length === 0) return;
        const container = carouselRef.current;
        const cardWidth = container.offsetWidth; // Full width per slide on TV

        if (activeIndex === slides.length) {
            container.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });
            const timer = setTimeout(() => {
                container.scrollTo({ left: 0, behavior: 'auto' });
                setActiveIndex(0);
            }, 700);
            return () => clearTimeout(timer);
        } else {
            container.scrollTo({ left: activeIndex * cardWidth, behavior: 'smooth' });
        }
    }, [activeIndex, slides]);

    const scrollCarousel = (direction) => {
        if (direction === 'left') {
            setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
        } else {
            setActiveIndex((prev) => prev + 1);
        }
    };

    // Dynamic Theme Map (To match Anime=Yellow, Movies=Red, Series=Purple)
    const themes = {
        'yellow-500': { text: 'text-yellow-500', bg: 'bg-yellow-500', shadow: 'shadow-[0_0_50px_rgba(234,179,8,0.4)]', focus: 'focus:border-yellow-500' },
        'red-600': { text: 'text-red-600', bg: 'bg-red-600', shadow: 'shadow-[0_0_50px_rgba(220,38,38,0.4)]', focus: 'focus:border-red-600' },
        'neon-purple': { text: 'text-neon-purple', bg: 'bg-neon-purple', shadow: 'shadow-[0_0_50px_rgba(168,85,247,0.4)]', focus: 'focus:border-neon-purple' },
        'neon-cyan': { text: 'text-neon-cyan', bg: 'bg-neon-cyan', shadow: 'shadow-[0_0_50px_rgba(0,255,255,0.4)]', focus: 'focus:border-neon-cyan' }
    };
    const t = themes[themeColor] || themes['neon-cyan'];

    if (!slides || slides.length === 0) return null;

    return (
        <div className="relative w-full h-[75vh] mb-20 group/tvhero">

            {/* The Scrolling Track */}
            <div
                ref={carouselRef}
                className="flex w-full h-full overflow-x-hidden no-scrollbar snap-x snap-mandatory"
            >
                {[...slides, ...slides.slice(0, 1)].map((m, idx) => (
                    <div
                        key={`${m.id}-${idx}`}
                        className="w-full h-full shrink-0 snap-center relative"
                    >
                        {/* 4K Backdrop */}
                        <img
                            src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${m.backdrop_path}`}
                            className="w-full h-full object-cover opacity-60"
                            alt={m.title || m.name}
                        />

                        {/* Cinematic Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/60 to-transparent z-10" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#020202] via-[#020202]/80 to-transparent z-10" />

                        {/* Content Matrix */}
                        <div className="absolute bottom-20 left-20 z-20 max-w-5xl">
                            <div className="flex items-center gap-6 mb-6 text-2xl font-black uppercase tracking-[0.3em] text-zinc-400">
                                <span className={`flex items-center gap-3 ${t.text}`}>
                                    <ShieldCheck size={32} /> Prime
                                </span>
                                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                <span className="flex items-center gap-3 text-yellow-400">
                                    <Star size={28} fill="currentColor" /> {m.vote_average?.toFixed(1)}
                                </span>
                                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                <span>{(m.release_date || m.first_air_date)?.split('-')[0]}</span>
                            </div>

                            <h1 className="text-[7rem] font-black uppercase italic tracking-tighter text-white leading-[0.85] mb-8 drop-shadow-2xl line-clamp-2">
                                {m.title || m.name}
                            </h1>

                            <p className="text-3xl text-zinc-300 leading-relaxed italic max-w-4xl opacity-90 line-clamp-3 mb-12">
                                {m.overview}
                            </p>

                            {/* TV Focusable Action Buttons */}
                            <div className="flex gap-8">
                                <button
                                    tabIndex="0"
                                    onClick={() => onPlay(m)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'ArrowRight') scrollCarousel('right');
                                        if (e.key === 'ArrowLeft') scrollCarousel('left');
                                    }}
                                    className={`bg-white text-black px-16 py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest outline-none focus:scale-110 transition-all flex items-center gap-4 group ${t.focus} ${t.shadow}`}
                                >
                                    <Play fill="black" size={36} className="group-focus:animate-pulse" />
                                    Initialize
                                </button>
                                <button
                                    tabIndex="0"
                                    onClick={() => onInfo(m)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'ArrowRight') scrollCarousel('right');
                                        if (e.key === 'ArrowLeft') scrollCarousel('left');
                                    }}
                                    className={`bg-black/50 backdrop-blur-xl text-white px-12 py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest outline-none focus:scale-110 transition-all border-4 border-white/10 flex items-center gap-4 ${t.focus}`}
                                >
                                    <Info size={36} className={t.text} />
                                    Database
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TV Carousel Indicators */}
            <div className="absolute bottom-10 right-20 z-30 flex gap-4">
                {slides.map((_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-full transition-all duration-500 ${activeIndex === i ? `w-16 ${t.bg} ${t.shadow}` : 'w-4 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default TVCarouselHero;