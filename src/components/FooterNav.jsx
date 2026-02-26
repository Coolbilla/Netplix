import React, { useState } from 'react';
import {
    Users, Zap, List, Radio, LayoutGrid,
    Home, Film, Tv, X, Globe, Search // Added Globe
} from 'lucide-react';

const FooterNav = ({ activeTab, setActiveTab, setCategory, setCurrentPage }) => {
    const [isWheelOpen, setIsWheelOpen] = useState(false);

    const handleHubNavigation = (targetPage) => {
        setActiveTab('home');
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
            {/* --- THE HOLOGRAPHIC HUB (THE WHEEL) --- */}
            {isWheelOpen && (
                <div className="fixed inset-0 z-[250] flex items-end justify-center pb-36 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-[#020617]/70 backdrop-blur-md" onClick={() => setIsWheelOpen(false)} />

                    <div className="relative w-72 h-72 flex items-center justify-center animate-in zoom-in-50 duration-500">
                        {/* Circular Ring Path (Visual Only) */}
                        <div className="absolute inset-0 border border-white/5 rounded-full scale-90" />

                        {/* --- NODE 1: HOME (Top Center) --- */}
                        <div onClick={() => handleHubNavigation('Home')}
                            className="absolute top-0 flex flex-col items-center gap-1 group cursor-pointer animate-in slide-in-from-bottom-10">
                            <div className="w-12 h-12 bg-[#0a0a0a] border border-white/10 rounded-xl flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all">
                                <Home size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Home</span>
                        </div>

                        {/* --- NODE 2: MOVIES (Top Left) --- */}
                        <div onClick={() => handleHubNavigation('Movies')}
                            className="absolute left-4 top-20 flex flex-col items-center gap-1 group cursor-pointer animate-in slide-in-from-right-10 delay-75">
                            <div className="w-12 h-12 bg-[#0a0a0a] border border-neon-cyan/20 rounded-xl flex items-center justify-center text-neon-cyan shadow-neon active:scale-90 transition-all">
                                <Film size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Cinema</span>
                        </div>

                        {/* --- NODE 3: SHOWS (Top Right) --- */}
                        <div onClick={() => handleHubNavigation('Series')}
                            className="absolute right-4 top-20 flex flex-col items-center gap-1 group cursor-pointer animate-in slide-in-from-left-10 delay-100">
                            <div className="w-12 h-12 bg-[#0a0a0a] border border-neon-purple/20 rounded-xl flex items-center justify-center text-neon-purple shadow-neon-purple active:scale-90 transition-all">
                                <Tv size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Series</span>
                        </div>

                        {/* --- NODE 4: COUNTRY / SECTOR (Bottom Left) --- */}
                        <div onClick={() => handleHubNavigation('Country')}
                            className="absolute left-10 bottom-12 flex flex-col items-center gap-1 group cursor-pointer animate-in slide-in-from-top-10 delay-150">
                            <div className="w-12 h-12 bg-[#0a0a0a] border border-cyan-400/20 rounded-xl flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-90 transition-all">
                                <Globe size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Country</span>
                        </div>

                        {/* --- NODE 5: ANIME (Bottom Right) --- */}
                        <div onClick={() => handleHubNavigation('Anime')}
                            className="absolute right-10 bottom-12 flex flex-col items-center gap-1 group cursor-pointer animate-in slide-in-from-top-10 delay-200">
                            <div className="w-12 h-12 bg-[#0a0a0a] border border-yellow-500/20 rounded-xl flex items-center justify-center text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-90 transition-all">
                                <Zap size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Anime</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ULTRA-SLIM GLASS NAV BAR --- */}
            {/* ... keeping your existing Footer Bar code here ... */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] w-[85%] max-w-[320px] md:hidden">
                <nav className="glass-panel py-2 px-3 rounded-full border border-white/10 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.8)] bg-black/50 backdrop-blur-3xl relative">

                    {/* LEFT SECTION */}
                    <div className="flex flex-1 justify-around items-center">
                        <button onClick={() => handleMainTabNavigation('party', 'Party')} className={`relative p-2 transition-all duration-300 ${activeTab === 'party' ? 'text-green-400 scale-110' : 'text-zinc-600'}`}>
                            <Users size={18} strokeWidth={activeTab === 'party' ? 2.5 : 2} />
                            {activeTab === 'party' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />}
                        </button>
                        <button onClick={() => handleMainTabNavigation('live', 'LiveTV')} className={`relative p-2 transition-all duration-300 ${activeTab === 'live' ? 'text-neon-cyan scale-110' : 'text-zinc-600'}`}>
                            <Radio size={18} strokeWidth={activeTab === 'live' ? 2.5 : 2} />
                            {activeTab === 'live' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-neon-cyan rounded-full shadow-neon" />}
                        </button>
                    </div>

                    {/* THE CENTRAL POWER CORE (Trigger) */}
                    <div className="relative w-12 h-12 -translate-y-3 flex items-center justify-center shrink-0 mx-2">
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

                    {/* RIGHT SECTION */}
                    <div className="flex flex-1 justify-around items-center">
                        <button onClick={() => { setIsWheelOpen(false); document.getElementById('global-search-btn')?.click(); }} className={`relative p-2 transition-all duration-300 text-zinc-600`}>
                            <Search size={18} strokeWidth={2} />
                        </button>
                        <button onClick={() => handleMainTabNavigation('list', 'MyList')} className={`relative p-2 transition-all duration-300 ${activeTab === 'list' ? 'text-white scale-110' : 'text-zinc-600'}`}>
                            <List size={18} strokeWidth={activeTab === 'list' ? 2.5 : 2} />
                            {activeTab === 'list' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />}
                        </button>
                    </div>

                </nav>
            </div>
        </>
    );
};

export default FooterNav;