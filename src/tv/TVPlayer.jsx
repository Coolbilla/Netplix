import React, { useState, useEffect, useRef } from 'react';
import { getFlixerUrl } from '../utils/cinezo';
import { X, Server, ShieldAlert } from 'lucide-react';

const TVPlayer = ({ media, toggleCompleted, onClose }) => {
    // Extract variables from the passed media object
    const tmdbId = media.id;
    const type = media.media_type || (media.first_air_date ? 'tv' : 'movie');
    const season = media.season || 1;
    const episode = media.episode || 1;

    const [activeServer, setActiveServer] = useState('cinezo');
    const [showAdWarning, setShowAdWarning] = useState(true);
    const [showPostPlay, setShowPostPlay] = useState(false);

    const closeBtnRef = useRef(null);
    const vaultBtnRef = useRef(null);

    // Auto-hide the ad warning after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => setShowAdWarning(false), 10000);
        return () => clearTimeout(timer);
    }, []);

    // --- TV REMOTE HARDWARE MAPPING ---
    useEffect(() => {
        const handleRemoteKeys = (e) => {
            // TV "Back" or "Return" button
            if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 10009) {
                if (showPostPlay) {
                    setShowPostPlay(false);
                } else {
                    setShowPostPlay(true); // INTERCEPT
                }
            }
        };

        window.addEventListener('keydown', handleRemoteKeys);

        // Auto-focus logic
        if (showPostPlay && vaultBtnRef.current) {
            vaultBtnRef.current.focus();
        } else if (!showPostPlay && closeBtnRef.current) {
            closeBtnRef.current.focus();
        }

        return () => window.removeEventListener('keydown', handleRemoteKeys);
    }, [showPostPlay, onClose]);

    const handleMarkAsCompleted = () => {
        toggleCompleted(media);
        onClose();
    };


    // --- SERVER URL LOGIC ---
    const cinezoUrl = getFlixerUrl(tmdbId, type, season, episode);
    const vidoraUrl = type === 'tv'
        ? `https://vidora.su/tv/${tmdbId}/${season}/${episode}?autoplay=true&colour=00ffff`
        : `https://vidora.su/movie/${tmdbId}?autoplay=true&colour=00ffff`;

    const streamUrl = activeServer === 'cinezo' ? cinezoUrl : vidoraUrl;

    if (showPostPlay) {
        return (
            <div className="fixed inset-0 z-[6000] bg-[#020202] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 font-sans p-12">
                <div className="absolute inset-0 z-0">
                    <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${media.backdrop_path}`} className="w-full h-full object-cover opacity-20 blur-2xl saturate-200" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/80 to-[#020202]/80" />
                </div>

                <div className="relative z-10 max-w-4xl w-full bg-black/60 backdrop-blur-3xl border border-white/10 p-16 rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] text-center flex flex-col items-center">
                    <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${media.poster_path}`} className="w-48 aspect-[2/3] object-cover rounded-3xl shadow-2xl mb-12 border border-white/5" alt="" />
                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">Finished Watching?</h2>
                    <p className="text-zinc-400 text-2xl font-medium mb-16 max-w-2xl leading-relaxed">
                        Did you finish <span className="text-white">"{media.title || media.name}"</span>? Mark it as watched or keep it in your active history.
                    </p>

                    <div className="flex gap-8 w-full justify-center">
                        <button
                            ref={vaultBtnRef}
                            tabIndex="0"
                            onClick={handleMarkAsCompleted}
                            className="bg-yellow-500 text-black px-16 py-8 rounded-[2rem] font-black uppercase tracking-widest text-xl transition-all outline-none focus:scale-110 focus:shadow-[0_0_50px_rgba(234,179,8,0.5)] flex items-center justify-center gap-4"
                        >
                            Mark as Watched
                        </button>
                        <button
                            tabIndex="0"
                            onClick={onClose}
                            className="bg-white/10 text-white px-16 py-8 rounded-[2rem] font-black uppercase tracking-widest text-xl transition-all border-2 border-white/10 outline-none focus:scale-110 focus:bg-white focus:text-black"
                        >
                            Just Close
                        </button>
                    </div>

                    <button
                        tabIndex="0"
                        onClick={() => setShowPostPlay(false)}
                        className="mt-12 text-zinc-500 hover:text-white flex items-center gap-4 text-sm uppercase font-black tracking-[0.3em] outline-none focus:text-neon-cyan"
                    >
                        Back to Video
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[5000] bg-black flex flex-col animate-in fade-in duration-500 overflow-hidden font-sans">

            {/* TV Player Header (Fades out when not focused) */}
            <div className="absolute top-0 left-0 w-full p-12 z-[5010] bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between group focus-within:opacity-100 opacity-0 hover:opacity-100 transition-opacity duration-500">

                {/* Close & Meta */}
                <div className="flex items-center gap-8">
                    <button
                        ref={closeBtnRef}
                        onClick={() => setShowPostPlay(true)}
                        tabIndex="0"
                        className="text-white/70 bg-black/40 p-5 rounded-full border border-white/10 outline-none focus:scale-125 focus:text-neon-cyan focus:border-neon-cyan focus:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all"
                    >
                        <X size={40} />
                    </button>
                    <div>
                        <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.4em] mb-1">
                            Engine: <span className="text-neon-cyan">{activeServer === 'cinezo' ? 'Flixer' : 'Vidora'}</span>
                        </p>
                        <h2 className="text-white font-black text-3xl italic tracking-tighter uppercase">
                            {type === 'tv' ? `Season ${season} : Episode ${episode}` : media.title || media.name}
                        </h2>
                    </div>
                </div>

                {/* TV Server Switcher (Focusable) */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveServer('cinezo')}
                        tabIndex="0"
                        className={`px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all outline-none focus:scale-110 focus:shadow-[0_0_40px_rgba(0,255,255,0.4)] ${activeServer === 'cinezo'
                            ? 'bg-neon-cyan text-black border-4 border-white'
                            : 'bg-zinc-900/80 text-zinc-500 border border-white/10 focus:border-neon-cyan focus:text-white'
                            }`}
                    >
                        Server Alpha
                    </button>
                    <button
                        onClick={() => setActiveServer('vidora')}
                        tabIndex="0"
                        className={`px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all outline-none focus:scale-110 focus:shadow-[0_0_40px_rgba(0,255,255,0.4)] ${activeServer === 'vidora'
                            ? 'bg-neon-cyan text-black border-4 border-white'
                            : 'bg-zinc-900/80 text-zinc-500 border border-white/10 focus:border-neon-cyan focus:text-white'
                            }`}
                    >
                        Server Beta
                    </button>
                </div>
            </div>

            {/* TV Ad Warning (Bigger and bolder) */}
            {showAdWarning && (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[5020] bg-zinc-900/95 border-4 border-red-600/50 text-white px-12 py-8 rounded-[3rem] flex items-center gap-8 shadow-[0_0_100px_rgba(220,38,38,0.4)] backdrop-blur-3xl animate-in slide-in-from-bottom-10 fade-in duration-700 max-w-5xl">
                    <div className="bg-red-600/20 p-4 rounded-full border border-red-600/30">
                        <ShieldAlert className="text-red-500" size={48} />
                    </div>
                    <div className="flex-1">
                        <p className="text-3xl font-black italic tracking-tighter uppercase mb-2">Ad-Blocker Recommended</p>
                        <p className="text-xl text-zinc-400 font-medium">Use <strong className="text-white">Brave Browser</strong> or <strong className="text-white">uBlock Origin</strong> on your TV for optimal playback.</p>
                    </div>
                    <button
                        tabIndex="0"
                        onClick={() => setShowAdWarning(false)}
                        className="text-zinc-500 outline-none focus:text-white focus:bg-red-600 bg-zinc-800 p-5 rounded-full transition-all focus:scale-110"
                    >
                        <X size={32} />
                    </button>
                </div>
            )}

            {/* The Main Iframe Engine */}
            <div className="flex-1 w-full h-full relative">
                <iframe
                    key={streamUrl}
                    src={streamUrl}
                    className="w-full h-full border-none"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                    scrolling="no"
                    title={`${activeServer} Stream Engine`}
                />
            </div>
        </div>
    );
};

export default TVPlayer;