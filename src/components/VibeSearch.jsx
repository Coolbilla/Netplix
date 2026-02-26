import React, { useState, useEffect, useRef } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import {
    Sparkles, X, Loader2, Play, Info, BrainCircuit,
    ArrowRight, CheckCircle2, Film, Tv, Ghost, Cat,
    Flame, Zap, Heart, Globe, ArrowLeft
} from 'lucide-react';




const CATEGORIES = [
    { id: 'movie', label: 'Movies', icon: <Film size={14} /> },
    { id: 'tv', label: 'TV Shows', icon: <Tv size={14} /> },
    { id: 'anime', label: 'Anime', icon: <Ghost size={14} /> },
    { id: 'cartoon', label: 'Cartoons', icon: <Cat size={14} /> }
];

const QUICK_PROMPTS = [
    { icon: <Flame size={14} className="text-orange-500" />, text: "Trending Masterpieces", query: "trending highly rated blockbuster" },
    { icon: <BrainCircuit size={14} className="text-purple-400" />, text: "Mind-Bending Sci-Fi", query: "mind bending sci-fi plot twist" },
    { icon: <Heart size={14} className="text-pink-500" />, text: "Feel-Good & Cozy", query: "feel good cozy romantic comedy" },
    { icon: <Zap size={14} className="text-neon-cyan" />, text: "High-Octane Action", query: "fast paced adrenaline action martial arts" }
];

const VIBE_QUESTIONS = [
    { id: 'pacing', question: "What's the energy level?", options: ["Slow & Atmospheric", "Balanced & Steady", "Non-stop Adrenaline", "Mind-Bending"] },
    { id: 'tone', question: "What is the emotional tone?", options: ["Hopeful & Uplifting", "Dark & Bleak", "Hilarious & Light", "Tense & Suspenseful"] },
    { id: 'reality', question: "Where does this take place?", options: ["Grounded in Reality", "Sci-Fi / Futuristic", "High Fantasy / Magic", "Supernatural / Horror"] },
    { id: 'visuals', question: "How should it look?", options: ["Gritty & Raw", "Bright & Colorful", "Highly Stylized / Neon", "Classic / Vintage"] },
    { id: 'era', question: "Which era are we feeling?", options: ["Classic (Pre-2000s)", "Nostalgic (2000s)", "Modern Hits (2010s+)", "Brand New"] }
];

const VibeSearch = ({ user, onClose, onPlay, onMoreInfo }) => {
    const [step, setStep] = useState(0);
    const [activeTab, setActiveTab] = useState('movie');
    const [initialThought, setInitialThought] = useState('');
    const [originInput, setOriginInput] = useState('');
    const [answers, setAnswers] = useState({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [results, setResults] = useState({ movie: [], tv: [], anime: [], cartoon: [] });
    const [loadingText, setLoadingText] = useState('');

    const inputRef = useRef(null);
    const originRef = useRef(null);
    const completedIds = user?.completed?.map(m => m.id) || [];

    useEffect(() => {
        if (step === 0 && inputRef.current) inputRef.current.focus();
        if (step === 6 && originRef.current) originRef.current.focus();
    }, [step]);

    // Re-trigger search when user switches category on results page
    useEffect(() => {
        if (step === 8) {
            executeNeuralSearch();
        }
    }, [activeTab]);

    const handleQuickPrompt = (query) => {
        setInitialThought(query);
        setStep(1);
    };

    const handleNextQuestion = (optionValue) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        const currentQ = VIBE_QUESTIONS[step - 1];
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionValue }));

        setTimeout(() => {
            setIsTransitioning(false);
            setStep(step + 1);
        }, 600);
    };

    const executeNeuralSearch = async () => {
        setStep(7);
        setLoadingText(`Searching ${activeTab.toUpperCase()}...`);

        try {
            let langParam = "";
            let regionParam = "";
            const industry = originInput.toLowerCase();

            if (industry.includes('bollywood') || industry.includes('hindi') || industry.includes('india')) {
                langParam = "&with_original_language=hi";
                regionParam = "&region=IN";
            } else if (industry.includes('hollywood') || industry.includes('american') || industry.includes('usa')) {
                langParam = "&with_original_language=en";
                regionParam = "&region=US";
            } else if (industry.includes('korean') || industry.includes('k drama') || industry.includes('korea')) {
                langParam = "&with_original_language=ko";
            }

            let endpoint = (activeTab === 'movie') ? 'discover/movie' : 'discover/tv';
            let extraParams = "";
            if (activeTab === 'anime') extraParams = "&with_genres=16&with_keywords=210024|287501";
            if (activeTab === 'cartoon') extraParams = "&with_genres=16";

            const randomPage = Math.floor(Math.random() * 3) + 1;
            const response = await neuralFetch(
                `/${endpoint}${langParam}${regionParam}${extraParams}&sort_by=popularity.desc&page=${randomPage}`
            );

            const cleanResults = response.data.results
                .filter(m => m.poster_path && m.backdrop_path && !completedIds.includes(m.id))
                .slice(0, 15);

            setTimeout(() => {
                setResults(prev => ({ ...prev, [activeTab]: cleanResults }));
                setStep(8);
            }, 800);

        } catch (error) {
            console.error("Neural link failed", error);
            setLoadingText("Neural link severed. Resetting...");
            setTimeout(() => setStep(0), 2000);
        }
    };

    return (
        <div className="fixed inset-0 z-[9000] flex flex-col overflow-hidden font-sans text-white">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl z-0" />

            {/* TOP BAR */}
            {step !== 8 && (
                <div className="relative z-[100] w-full p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3 text-neon-cyan bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <BrainCircuit size={18} className={step === 7 ? "animate-spin" : "animate-pulse"} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Concierge</span>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/10 hover:bg-red-500/80 text-white rounded-full transition-all border border-white/20 backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-6 pb-20">

                {/* STEP 0: SEARCH ONLY */}
                {step === 0 && (
                    <div className="w-full max-w-3xl text-center animate-in fade-in zoom-in-95 duration-700">
                        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 leading-none">
                            What's the <span className="text-neon-cyan">Vibe?</span>
                        </h2>

                        <form onSubmit={(e) => { e.preventDefault(); if (initialThought.length > 2) setStep(1); }} className="relative mb-8">
                            <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/20 rounded-full p-1.5 shadow-2xl">
                                <div className="pl-5 text-zinc-500"><Sparkles size={18} /></div>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={initialThought}
                                    onChange={(e) => setInitialThought(e.target.value)}
                                    placeholder="e.g. A dark, gritty thriller in Tokyo..."
                                    className="w-full bg-transparent py-4 pl-3 pr-4 outline-none focus:ring-0 border-none placeholder:text-zinc-600 font-medium"
                                />
                                <button type="submit" className="px-6 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full font-black uppercase tracking-widest text-[10px] border border-white/5 mr-1 flex items-center gap-2">
                                    Analyze <ArrowRight size={14} />
                                </button>
                            </div>
                        </form>

                        <div className="flex flex-wrap justify-center gap-3">
                            {QUICK_PROMPTS.map((prompt, idx) => (
                                <button key={idx} onClick={() => handleQuickPrompt(prompt.query)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center gap-2 transition-all text-xs font-semibold text-zinc-300">
                                    {prompt.icon} {prompt.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEPS 1-6 (Questions & Origin) remain the same logic ... */}
                {step > 0 && step <= VIBE_QUESTIONS.length && (
                    <div className="w-full max-w-4xl text-center animate-in fade-in slide-in-from-right-10 duration-500">
                        <div className="inline-block bg-white/10 border border-white/20 px-4 py-1.5 rounded-full mb-6 backdrop-blur-md">
                            <span className="text-neon-cyan font-black uppercase tracking-widest text-[10px]">Deep Scan {step} / 5</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-12">
                            {isTransitioning ? "Calibrating..." : VIBE_QUESTIONS[step - 1].question}
                        </h2>
                        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}>
                            {VIBE_QUESTIONS[step - 1].options.map((opt, idx) => (
                                <button key={idx} onClick={() => handleNextQuestion(opt)} className="p-8 rounded-3xl bg-black/40 border border-white/10 hover:border-neon-cyan/50 hover:bg-neon-cyan/10 transition-all text-left group">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg group-hover:text-neon-cyan transition-colors">{opt}</span>
                                        <CheckCircle2 size={20} className="text-zinc-800 group-hover:text-neon-cyan" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === 6 && (
                    <div className="w-full max-w-2xl text-center animate-in zoom-in-95 duration-500">
                        <div className="inline-block bg-neon-cyan/10 border border-neon-cyan/30 px-4 py-1.5 rounded-full mb-6">
                            <span className="text-neon-cyan font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                <Globe size={12} /> Localization Protocol
                            </span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-10">
                            Industry <span className="text-neon-cyan">&</span> Country?
                        </h2>
                        <div className="relative flex items-center bg-black/60 backdrop-blur-xl border-2 border-neon-cyan/20 rounded-3xl p-2">
                            <input
                                ref={originRef}
                                type="text"
                                value={originInput}
                                onChange={(e) => setOriginInput(e.target.value)}
                                placeholder="e.g. Bollywood, South Korea..."
                                className="w-full bg-transparent p-6 text-2xl font-bold text-white outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && executeNeuralSearch()}
                            />
                            <button onClick={executeNeuralSearch} className="bg-neon-cyan text-black h-16 w-16 rounded-2xl flex items-center justify-center">
                                <ArrowRight size={24} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 7 && (
                    <div className="flex flex-col items-center space-y-8 text-center">
                        <Loader2 size={48} className="text-neon-cyan animate-spin" />
                        <h3 className="text-xl md:text-3xl font-black uppercase tracking-widest animate-pulse">{loadingText}</h3>
                    </div>
                )}
            </div>

            {/* STEP 8: RESULTS FEED WITH CATEGORY SELECTOR */}
            {step === 8 && results[activeTab] && (
                <div className="absolute inset-0 z-30 bg-[#020202] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom-full duration-1000">

                    {/* Fixed Header Overlay for Go Back & AI Status */}
                    <div className="fixed top-0 left-0 w-full z-40 p-5 flex justify-between items-center bg-gradient-to-b from-[#020202] via-[#020202]/80 to-transparent pointer-events-none px-6 md:px-12">
                        {/* Left: Back Button */}
                        <div className="flex-1 flex justify-start">
                            <button onClick={onClose} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20 backdrop-blur-md pointer-events-auto flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 shadow-xl">
                                <ArrowLeft size={16} /> <span className="hidden md:inline">Go Back to Home</span><span className="md:hidden">Back</span>
                            </button>
                        </div>

                        {/* Center: AI Cool Status Logo */}
                        <div className="flex-1 flex justify-center">
                            <div className="px-5 py-2.5 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 backdrop-blur-md flex items-center gap-3 shadow-[0_0_20px_rgba(0,255,255,0.2)]">
                                <BrainCircuit size={16} className="text-neon-cyan animate-pulse" />
                                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-neon-cyan">Neural Feed Active</span>
                            </div>
                        </div>

                        {/* Right: Data Sync Animation */}
                        <div className="flex-1 flex justify-end items-center gap-3 opacity-80">
                            <span className="hidden md:inline text-[10px] font-bold tracking-[0.2em] uppercase text-neon-cyan">Live Matrix Sync</span>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-cyan"></span>
                            </span>
                        </div>
                    </div>

                    {/* Floating Category Switcher on Results Page */}
                    <div className="sticky top-24 z-[110] flex justify-center gap-2 py-4 pointer-events-none">
                        <div className="flex gap-2 p-1.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full pointer-events-auto shadow-2xl">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all text-[10px] font-black uppercase tracking-widest ${activeTab === cat.id ? 'bg-neon-cyan text-black shadow-[0_0_20px_rgba(0,255,255,0.3)]' : 'hover:bg-white/5 text-zinc-400'}`}
                                >
                                    {cat.icon} {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {results[activeTab].length > 0 ? (
                        <>
                            {/* Hero Section */}
                            <div className="relative w-full h-[85vh]">
                                <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${results[activeTab][0].backdrop_path}`} className="w-full h-full object-cover saturate-150" alt="Hero" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-[#020202]/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
                                    <span className="text-neon-cyan font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Primary Match</span>
                                    <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-6">{results[activeTab][0].title || results[activeTab][0].name}</h1>
                                    <div className="flex gap-4">
                                        <button onClick={() => onPlay(results[activeTab][0])} className="px-10 py-5 bg-neon-cyan text-black rounded-2xl font-black uppercase text-xs flex items-center gap-3 hover:scale-105 transition-all">
                                            <Play fill="black" size={18} /> Link Start
                                        </button>
                                        <button onClick={() => onMoreInfo(results[activeTab][0])} className="px-10 py-5 bg-white/10 text-white rounded-2xl font-black uppercase text-xs border border-white/20 backdrop-blur-md">
                                            Intel
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Section */}
                            <div className="px-6 md:px-12 py-20 max-w-[1800px] mx-auto">
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                                    <div className="h-px flex-1 bg-white/10" />
                                    Alternative {activeTab} matches
                                    <div className="h-px flex-1 bg-white/10" />
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                                    {results[activeTab].slice(1).map((m) => (
                                        <div key={m.id} className="group relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 hover:scale-105">
                                            <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${m.poster_path}`} className="w-full h-full object-cover" alt={m.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all p-6 flex flex-col justify-end">
                                                <p className="text-white font-black text-xs uppercase mb-4">{m.title || m.name}</p>
                                                <button onClick={() => onPlay(m)} className="bg-white text-black py-3 rounded-xl font-bold text-[10px] uppercase">Play Now</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-screen flex flex-col items-center justify-center">
                            <Ghost size={40} className="text-zinc-700 mb-4" />
                            <p className="text-zinc-500 font-bold uppercase tracking-widest">No Matches found in this sector</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VibeSearch;