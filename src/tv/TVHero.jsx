import React from 'react';
import { Play, Info, Star, Calendar, ShieldCheck } from 'lucide-react';

const TVHero = ({ movie, onPlay, onInfo }) => {
    if (!movie) return null;

    return (
        <div className="relative h-[85vh] w-full flex items-end px-20 pb-20 overflow-hidden rounded-[3rem] border-4 border-white/5 shadow-2xl mb-20 bg-black shrink-0">
            {/* 4K Backdrop */}
            <div className="absolute inset-0 z-0">
                <img
                    src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                    className="w-full h-full object-cover opacity-60"
                    alt={movie.title || movie.name}
                />
                {/* Cinematic Gradients for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
            </div>

            {/* Content Matrix */}
            <div className="relative z-10 max-w-5xl animate-in slide-in-from-bottom-10 duration-1000">
                <div className="flex items-center gap-6 mb-6 text-2xl font-black uppercase tracking-[0.3em] text-zinc-400">
                    <span className="flex items-center gap-3 text-neon-cyan">
                        <ShieldCheck size={32} /> IMAX Enhanced
                    </span>
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <span className="flex items-center gap-3 text-yellow-400">
                        <Star size={28} fill="currentColor" /> {movie.vote_average?.toFixed(1)}
                    </span>
                    <div className="w-2 h-2 rounded-full bg-zinc-700" />
                    <span>{(movie.release_date || movie.first_air_date)?.split('-')[0]}</span>
                </div>

                <h1 className="text-[7rem] font-black uppercase italic tracking-tighter text-white leading-[0.85] mb-8 drop-shadow-2xl">
                    {movie.title || movie.name}
                </h1>

                <p className="text-3xl text-zinc-300 leading-relaxed italic max-w-4xl opacity-90 line-clamp-3 mb-12">
                    {movie.overview}
                </p>

                <div className="flex gap-8">
                    <button
                        tabIndex="0"
                        onClick={() => onPlay(movie)}
                        className="bg-white text-black px-16 py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest outline-none focus:bg-neon-cyan focus:scale-110 focus:shadow-[0_0_50px_rgba(0,255,255,0.4)] transition-all flex items-center gap-4 group"
                    >
                        <Play fill="black" size={36} className="group-focus:animate-pulse" />
                        Initialize
                    </button>
                    <button
                        tabIndex="0"
                        onClick={() => onInfo(movie)}
                        className="bg-black/50 backdrop-blur-xl text-white px-12 py-8 rounded-[2.5rem] font-black text-2xl uppercase tracking-widest outline-none focus:border-neon-cyan focus:bg-white/10 focus:scale-110 transition-all border-4 border-white/10 flex items-center gap-4"
                    >
                        <Info size={36} className="text-neon-cyan" />
                        Database
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TVHero;