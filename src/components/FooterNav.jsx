import React, { useState } from 'react';
import {
    Users, Zap, List, LayoutGrid,
    Home, Film, Tv, X, Globe, Search
} from 'lucide-react';

const FooterNav = ({ activeTab, setActiveTab, setCategory, setCurrentPage }) => {
    const [isWheelOpen, setIsWheelOpen] = useState(false);

    const handleHubNavigation = (targetPage, tabId = 'wheel') => {
        setActiveTab(tabId);
        setCurrentPage(targetPage);
        setIsWheelOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleMainTabNavigation = (tabId, pageName) => {
        setActiveTab(tabId);
        setCurrentPage(pageName);
        setIsWheelOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* --- THE HOLOGRAPHIC HUB (THE WHEEL) - SECONDARY FEATURES --- */}
            {isWheelOpen && (
                <div className="fixed inset-0 z-[250] flex items-end justify-center pb-36 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#020617]/70 backdrop-blur-md" onClick={() => setIsWheelOpen(false)} />

                    <div className="relative w-64 h-64 flex items-center justify-center animate-in zoom-in-50 duration-500">
                        {/* Circular Ring Path (Visual Only) */}
                        <div className="absolute inset-0 border border-white/5 rounded-full scale-90" />

                        {/* --- NODE 1: WATCH PARTY (Top Left) --- */}
                        <div onClick={() => handleHubNavigation('Party', 'party')}
                            className="absolute left-0 top-10 flex flex-col items-center gap-1 group cursor-pointer animate-in slide-in-from-right-10 delay-75">
                            <div className="w-12 h-12 bg-[#0a0a0a] border border-green-500/20 rounded-xl flex items-center justify-center text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)] active:scale-90 transition-all">
                                <Users size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Party</span>
                        </div>

                        {/* --- NODE 2: MY LIST (Top Right) --- */}
                        <div onClick={() => handleHubNavigation('MyList', 'list')}
                            className="absolute right-0 top-10 flex flex-col items-center gap-1 group cursor-pointer animate-in slide-in-from-left-10 delay-100">
                            <div className="w-12 h-12 bg-[#0a0a0a] border border-white/20 rounded-xl flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] active:scale-90 transition-all">
                                <List size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">My List</span>
                        </div>

                        {/* --- NODE 3: COUNTRY / SECTOR (Top Center) --- */}
                        <div onClick={() => handleHubNavigation('Country', 'country')}
                            className="absolute top-0 flex flex-col items-center gap-1 group cursor-pointer animate-in slide-in-from-bottom-10 delay-150">
                            <div className="w-12 h-12 bg-[#0a0a0a] border border-cyan-400/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-90 transition-all">
                                <Globe size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Sector</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ULTRA-SLIM GLASS NAV BAR - PRIMARY MEDIA --- */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-[400px] md:hidden">
                <nav className="glass-panel py-2 px-4 rounded-full border border-white/10 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-black/50 backdrop-blur-3xl relative">

                    {/* LEFT SECTION (Home & Movies) */}
                    <div className="flex flex-1 justify-around items-center pr-2">
                        <button onClick={() => handleMainTabNavigation('home', 'Home')} className={`relative p-2 transition-all duration-300 ${activeTab === 'home' ? 'text-white scale-110' : 'text-zinc-600'}`}>
                            <Home size={18} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                            {activeTab === 'home' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                        </button>
                        <button onClick={() => handleMainTabNavigation('movies', 'Movies')} className={`relative p-2 transition-all duration-300 ${activeTab === 'movies' ? 'text-neon-cyan scale-110' : 'text-zinc-600'}`}>
                            <Film size={18} strokeWidth={activeTab === 'movies' ? 2.5 : 2} />
                            {activeTab === 'movies' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-cyan rounded-full shadow-neon" />}
                        </button>
                    </div>

                    {/* THE CENTRAL POWER CORE (Trigger for Wheel) */}
                    <div className="relative w-12 h-12 -translate-y-3 flex items-center justify-center shrink-0 mx-1">
                        <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isWheelOpen ? 'bg-red-500/20 animate-ping' : 'bg-neon-cyan/20 animate-pulse'}`} />
                        <button
                            onClick={() => setIsWheelOpen(!isWheelOpen)}
                            className={`z-[310] w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-75 border-[3px] border-[#020617] ${isWheelOpen
                                ? 'bg-zinc-900 rotate-90 text-red-500'
                                : 'bg-white text-black shadow-neon'
                                }`}
                        >
                            {isWheelOpen ? <X size={18} strokeWidth={3} /> : <LayoutGrid size={18} strokeWidth={3} />}
                        </button>
                    </div>

                    {/* RIGHT SECTION (Series & Anime) */}
                    <div className="flex flex-1 justify-around items-center pl-2">
                        <button onClick={() => handleMainTabNavigation('series', 'Series')} className={`relative p-2 transition-all duration-300 ${activeTab === 'series' ? 'text-neon-purple scale-110' : 'text-zinc-600'}`}>
                            <Tv size={18} strokeWidth={activeTab === 'series' ? 2.5 : 2} />
                            {activeTab === 'series' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-purple rounded-full shadow-neon-purple" />}
                        </button>
                        <button onClick={() => handleMainTabNavigation('anime', 'Anime')} className={`relative p-2 transition-all duration-300 ${activeTab === 'anime' ? 'text-yellow-500 scale-110' : 'text-zinc-600'}`}>
                            <Zap size={18} strokeWidth={activeTab === 'anime' ? 2.5 : 2} />
                            {activeTab === 'anime' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)]" />}
                        </button>
                    </div>

                </nav>
            </div>
        </>
    );
};

export default FooterNav;
