import React from 'react';
import { Sparkles, Search as SearchIcon, Bell } from 'lucide-react';

const Navbar = ({ user, onVibeSearch, onSearchClick, setCurrentPage, setCategory, currentPage }) => {

    const handleNavigation = (link) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        switch (link) {
            case 'Home':
                setCurrentPage('Home');
                setCategory('All');
                break;
            case 'Watch Party':
                setCurrentPage('Party');
                break;
            case 'Live TV':
                setCurrentPage('LiveTV');
                break;
            case 'My List':
                setCurrentPage('MyList');
                break;
            case 'Movies':
                setCurrentPage('Movies');
                break;
            case 'TV Series':
                setCurrentPage('Series');
                break;
            case 'Anime':
                setCurrentPage('Anime');
                break;
            case 'Country':
                setCurrentPage('Country');
                break;
            default:
                break;
        }
    };

    return (
        <nav className="fixed top-0 w-full z-[100] px-4 md:px-12 py-4 flex items-center justify-between glass-panel !bg-[#020617]/80 !border-b-white/5 backdrop-blur-2xl transition-all duration-500">
            <div className="flex items-center gap-12">
                {/* --- ONLY NEW CYAN BRANDING --- */}
                <h1
                    className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase group cursor-pointer select-none transform hover:scale-105 active:scale-95 transition-all duration-300"
                    onClick={() => handleNavigation('Home')}
                >
                    Net<span className="text-neon-cyan group-hover:text-neon-purple transition-colors duration-700">plix</span>
                </h1>

                {/* MENU LINKS (Desktop Only) */}
                <div className="hidden lg:flex items-center gap-6">
                    {['Home', 'Movies', 'TV Series', 'Anime', 'Country', 'Live TV', 'My List', 'Watch Party'].map((link) => {
                        // Map the link text to the actual currentPage state string
                        const isActiveMap = {
                            'Home': 'Home',
                            'Movies': 'Movies',
                            'TV Series': 'Series',
                            'Anime': 'Anime',
                            'Country': 'Country',
                            'Live TV': 'LiveTV',
                            'My List': 'MyList',
                            'Watch Party': 'Party'
                        };
                        const isActive = currentPage === isActiveMap[link];

                        return (
                            <button
                                key={link}
                                onClick={() => handleNavigation(link)}
                                className={`
                                    text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300
                                    transform hover:scale-110 active:scale-90
                                    ${link === 'Live TV'
                                        ? 'bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:shadow-[0_0_20px_rgba(220,38,38,0.8)] mx-4'
                                        : isActive
                                            ? 'text-white drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] scale-105'
                                            : 'text-zinc-500 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                                    }
                                `}
                            >
                                {link}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* USER HUD (Always Visible) */}
            <div className="flex items-center gap-4 md:gap-6">
                <Sparkles
                    onClick={onVibeSearch}
                    className="text-neon-cyan hover:scale-125 active:scale-90 transition-all cursor-pointer hover:drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                    size={18}
                />

                <SearchIcon
                    onClick={onSearchClick}
                    className="text-zinc-400 hover:text-white hover:scale-125 active:scale-90 transition-all cursor-pointer hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                    size={18}
                />

                <Bell
                    onClick={() => setCurrentPage('Notifications')}
                    className="text-zinc-400 hover:text-white hover:scale-125 active:scale-90 transition-all cursor-pointer hidden sm:block hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                    size={18}
                />

                <div
                    className="flex items-center glass-panel !rounded-full p-0.5 border-white/10 transform hover:scale-110 active:scale-90 transition-all cursor-pointer hover:border-neon-cyan/50 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                    onClick={() => setCurrentPage('Profile')}
                >
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-neon-cyan/50 p-0.5 overflow-hidden">
                        <img src={user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ishaan'} className="w-full h-full rounded-full object-cover" alt="Profile" />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
