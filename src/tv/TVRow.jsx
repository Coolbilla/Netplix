import React, { useRef } from 'react';

const TVRow = ({ title, data, onSelect, onInfo, onFocusItem }) => {
    const rowRef = useRef(null);

    const handleFocus = (e, movie) => {
        if (onFocusItem) onFocusItem(movie);
        // Center the focused item smoothly
        e.target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="mb-16 relative z-20 w-full overflow-hidden">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white/80 mb-6 border-l-[6px] border-neon-cyan pl-4 ml-12">
                {title}
            </h2>

            {/* CRITICAL FIX: flex-nowrap prevents stacking! */}
            <div
                ref={rowRef}
                className="flex flex-nowrap items-start gap-8 overflow-x-auto no-scrollbar py-8 px-12 snap-x w-full"
            >
                {data.map((m) => (
                    <div
                        key={m.id}
                        tabIndex="0"
                        onFocus={(e) => handleFocus(e, m)}
                        onClick={() => onSelect(m)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSelect(m);
                            if (e.key === 'i' || e.key === 'I') onInfo(m);
                        }}
                        className="relative shrink-0 w-[260px] md:w-[300px] aspect-[2/3] rounded-[2rem] overflow-hidden border-4 border-transparent outline-none focus:border-white focus:scale-110 focus:shadow-[0_0_60px_rgba(255,255,255,0.4)] focus:z-50 bg-[#0a0a0a] group transition-all duration-300 snap-center cursor-pointer"
                    >
                        <img
                            src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${m.poster_path}`}
                            className="w-full h-full object-cover"
                            alt={m.title || m.name}
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-focus:opacity-100 transition-opacity flex flex-col justify-end p-6">
                            <h4 className="text-2xl font-black text-white uppercase italic truncate">
                                {m.title || m.name}
                            </h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TVRow;