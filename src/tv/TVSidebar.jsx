import React, { useState } from 'react';
import {
    Search, Sparkles, Home, Film, Tv, Zap, Radio,
    Trophy, Heart, Users, Globe // Added Globe for the Country page
} from 'lucide-react';

const TVSidebar = ({ activePage, onNavigate, user, onSearch, onVibeSearch }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const topActions = [
        { id: 'Search', label: 'Search Matrix', icon: <Search size={28} />, action: onSearch },
        { id: 'Vibe', label: 'Vibe Check AI', icon: <Sparkles size={28} />, action: onVibeSearch, color: 'text-neon-cyan' },
    ];

    const mainLinks = [
        { id: 'Home', label: 'Home', icon: <Home size={28} /> },
        { id: 'Movies', label: 'Movies', icon: <Film size={28} /> },
        { id: 'Series', label: 'TV Series', icon: <Tv size={28} /> },

        // --- NEW: COUNTRY HUB LINK ---
        {
            id: 'Country',
            label: 'Sector Hub',
            icon: <Globe size={28} />,
            color: 'text-cyan-400' // Matches the Cyber-Sector theme
        },

        { id: 'Anime', label: 'Anime Hub', icon: <Zap size={28} /> },
        { id: 'LiveTV', label: 'Live TV', icon: <Radio size={28} />, highlight: 'bg-red-600' },
        { id: 'F1Universe', label: 'F1 Universe', icon: <Trophy size={28} />, color: 'text-red-500' },
        { id: 'MyList', label: 'My List', icon: <Heart size={28} /> },
        { id: 'Party', label: 'Watch Party', icon: <Users size={28} /> },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 h-screen flex flex-col border-r border-white/5 bg-black/95 backdrop-blur-3xl transition-all duration-300 z-[9000] py-10 overflow-hidden
                ${isExpanded ? 'w-80 shadow-[50px_0_100px_rgba(0,0,0,0.9)]' : 'w-24'}
            `}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            onFocus={() => setIsExpanded(true)}
            onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setIsExpanded(false);
            }}
        >
            {/* Top Actions */}
            <div className="flex flex-col gap-4 px-4 w-full">
                {topActions.map((item) => (
                    <button
                        key={item.id}
                        tabIndex="0"
                        onClick={item.action}
                        className="flex items-center p-4 rounded-2xl transition-all outline-none focus:bg-white focus:text-black focus:scale-105 group"
                    >
                        <div className={`shrink-0 flex items-center justify-center w-8 ${item.color || 'text-zinc-400 group-focus:text-black'}`}>
                            {item.icon}
                        </div>
                        <span className={`font-black uppercase tracking-widest ml-6 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="h-px w-full bg-white/10 my-6" />

            {/* Main Links */}
            <div className="flex flex-col gap-2 px-4 w-full flex-1 overflow-y-auto no-scrollbar">
                {mainLinks.map((link) => {
                    const isActive = activePage === link.id;
                    return (
                        <button
                            key={link.id}
                            tabIndex="0"
                            onClick={() => onNavigate(link.id)}
                            className={`flex items-center p-4 rounded-2xl transition-all outline-none group
                                focus:bg-white focus:text-black focus:scale-105
                                ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                            `}
                        >
                            <div className={`shrink-0 flex items-center justify-center w-8 transition-colors
                                ${isActive ? 'text-neon-cyan' : link.color || 'text-zinc-400 group-focus:text-black'}
                            `}>
                                {link.icon}
                            </div>
                            <span className={`font-black uppercase tracking-widest ml-6 whitespace-nowrap transition-opacity duration-300
                                ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}
                                ${isActive ? 'text-neon-cyan group-focus:text-black' : 'text-zinc-300 group-focus:text-black'}
                            `}>
                                {link.label}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Profile Node */}
            <div className="px-4 mt-auto pt-6 border-t border-white/5">
                <button
                    tabIndex="0"
                    onClick={() => onNavigate('Profile')}
                    className="flex items-center p-2 rounded-3xl transition-all outline-none focus:bg-neon-cyan focus:text-black w-full"
                >
                    <div className="shrink-0 w-12 h-12 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
                        <img src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=TV'} className="w-full h-full object-cover" alt="Profile" />
                    </div>
                    <div className={`flex flex-col items-start ml-4 whitespace-nowrap transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                        <span className="text-sm font-black uppercase tracking-widest leading-none mb-1">{user?.displayName || 'Guest'}</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest italic">Identity Sync: {user?.region || 'GLOBAL'}</span>
                    </div>
                </button>
            </div>
        </nav>
    );
};

export default TVSidebar;