import React from 'react';

const StudioHub = ({ onSelect }) => {
    const studios = [
        {
            id: 'Marvel',
            name: 'Marvel',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg',
            glow: 'group-hover:shadow-[0_0_30px_rgba(237,29,36,0.3)]',
            border: 'group-hover:border-red-600/50'
        },
        {
            id: 'DC',
            name: 'DC',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/DC_Comics_logo.svg',
            glow: 'group-hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]',
            border: 'group-hover:border-blue-500/50'
        },
        {
            id: 'Disney',
            name: 'Disney',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Disney_Plus_logo.svg',
            glow: 'group-hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]',
            border: 'group-hover:border-neon-cyan/50'
        },
        {
            id: 'StarWars',
            name: 'Star Wars',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Star_Wars_Logo.svg',
            glow: 'group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]',
            border: 'group-hover:border-white/50'
        },
    ];

    return (
        <section className="px-4 md:px-12 mb-16 animate-in fade-in duration-700">
            {/* Clean Section Label */}
            <div className="flex items-center gap-3 mb-8 opacity-40">
                <div className="h-px w-8 bg-neon-cyan" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">
                    Universal Hubs
                </h3>
            </div>

            {/* Hub Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {studios.map((studio) => (
                    <div
                        key={studio.name}
                        onClick={() => onSelect(studio.id)}
                        className={`
                            glass-panel group relative aspect-video rounded-xl 
                            flex items-center justify-center p-8 md:p-12 cursor-pointer 
                            transition-all duration-500 border border-white/5 
                            ${studio.glow} ${studio.border} hover:scale-[1.05] hover:bg-white/[0.02]
                        `}
                    >
                        {/* 1. Shimmer Animation Layer */}
                        <div className="absolute inset-0 overflow-hidden rounded-xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                        </div>

                        {/* 2. THE FIX: Selective Filtering */}
                        <img
                            src={studio.logo}
                            className={`
                                w-full h-full object-contain transition-all duration-700 relative z-10
                                grayscale brightness-[1.5] opacity-40 
                                group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100
                            `}
                            alt={studio.name}
                        />

                        {/* 3. Interaction Corners */}
                        <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/0 group-hover:border-white/20 transition-all duration-500 rounded-tl-sm" />
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/0 group-hover:border-white/20 transition-all duration-500 rounded-br-sm" />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default StudioHub;