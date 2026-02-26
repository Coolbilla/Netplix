import React, { useEffect, useState, useRef, useCallback } from 'react';
import { neuralFetch } from '../utils/neuralFetch';
import { Play, Info, Loader2 } from 'lucide-react';





const UniversePage = ({ type, user, handlePlay, onMoreInfo }) => {
    const [rows, setRows] = useState([]);
    const [allContent, setAllContent] = useState([]);
    const [hero, setHero] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);

    // Intersection Observer for Infinite Scroll
    const observer = useRef();
    const lastElementRef = useCallback(node => {
        if (loading || fetchingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, fetchingMore, hasMore]);

    const universeConfig = {
        marvel: {
            name: 'Marvel',
            color: 'text-red-600',
            bg: 'from-red-900',
            logo: 'MARVEL UNIVERSE',
            companyId: 420,
            sections: [
                { title: 'Phase 1-3: Infinity Saga', query: 'with_companies=420&primary_release_date.lte=2019-12-31' },
                { title: 'Phase 4-5: Multiverse Saga', query: 'with_companies=420&primary_release_date.gte=2020-01-01' },
                { title: 'Sony Spider-Verse', query: 'with_companies=5&with_keywords=180547' },
                { title: 'Marvel Animated Universe', query: 'with_companies=420&with_genres=16', isTv: true }
            ]
        },
        dc: {
            name: 'DC',
            color: 'text-blue-500',
            bg: 'from-blue-900',
            logo: 'DC WORLDS',
            companyId: 9993,
            sections: [
                { title: 'DC Extended Universe', query: 'with_companies=128064|9993' },
                { title: 'Elseworlds & Joker', query: 'with_companies=174&with_keywords=849' }, // Warner Bros + DC Keyword
                { title: 'DC Animated Universe', query: 'with_companies=9993&with_genres=16', isTv: true }
            ]
        },
        disney: {
            name: 'Disney',
            color: 'text-cyan-400',
            bg: 'from-cyan-900',
            logo: 'DISNEY ORIGINALS',
            companyId: 2,
            sections: [
                { title: 'Walt Disney Classics', query: 'with_companies=2&with_genres=16&sort_by=primary_release_date.asc' },
                { title: 'The Pixar Era', query: 'with_companies=3' },
                { title: 'Disney Channel Originals', query: 'with_companies=2&with_genres=10751|35', isTv: true }
            ]
        },
        starwars: {
            name: 'Star Wars',
            color: 'text-yellow-400',
            bg: 'from-yellow-900',
            logo: 'STAR WARS',
            companyId: 1,
            sections: [
                { title: 'The Skywalker Saga', query: 'with_companies=1&sort_by=primary_release_date.asc' },
                { title: 'The New Republic Eras', query: 'with_companies=1&primary_release_date.gte=2019-01-01', isTv: true },
                { title: 'Animated Legacies', query: 'with_companies=1&with_genres=16', isTv: true }
            ]
        }
    };

    const config = universeConfig[type] || universeConfig.marvel;

    // Initial Fetch (Rows + First Page of Vault)
    useEffect(() => {
        const fetchUniverseData = async () => {
            setLoading(true);
            setAllContent([]);
            setPage(1);
            setHasMore(true);
            try {
                // Fetch specialized rows
                const rowPromises = config.sections.map(async (sec) => {
                    try {
                        const endpoint = sec.isTv ? 'tv' : 'movie';
                        const res = await neuralFetch(`/discover/${endpoint}?${sec.query}&sort_by=popularity.desc`);
                        return { title: sec.title, items: res?.data?.results?.filter(i => i.poster_path) || [] };
                    } catch (e) {
                        console.error(`Error fetching row ${sec.title}:`, e);
                        return { title: sec.title, items: [] };
                    }
                });

                const fetchedRows = await Promise.all(rowPromises);
                setRows(fetchedRows.filter(r => r?.items?.length > 0));

                // Fetch "The Vault" Page 1
                const [allResM, allResT] = await Promise.all([
                    neuralFetch(`/discover/movie?with_companies=${config.companyId}&sort_by=popularity.desc&page=1`).catch(() => ({ data: { results: [] } })),
                    neuralFetch(`/discover/tv?with_companies=${config.companyId}&sort_by=popularity.desc&page=1`).catch(() => ({ data: { results: [] } }))
                ]);

                const combined = [
                    ...(allResM?.data?.results || []).map(m => ({ ...m, media_type: 'movie' })),
                    ...(allResT?.data?.results || []).map(t => ({ ...t, media_type: 'tv' }))
                ].filter(i => i.poster_path);

                setAllContent(combined);
                if (combined.length > 0) setHero(combined[0]);
                if (combined.length === 0) setHasMore(false);

            } catch (err) {
                console.error("Universe Fetch Error:", err);
            }
            setLoading(false);
        };

        fetchUniverseData();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [type]);

    // Fetch More Content (Infinite Scroll)
    useEffect(() => {
        if (page === 1) return;

        const fetchMore = async () => {
            setFetchingMore(true);
            try {
                const [allResM, allResT] = await Promise.all([
                    neuralFetch(`/discover/movie?with_companies=${config.companyId}&sort_by=popularity.desc&page=${page}`).catch(() => ({ data: { results: [] } })),
                    neuralFetch(`/discover/tv?with_companies=${config.companyId}&sort_by=popularity.desc&page=${page}`).catch(() => ({ data: { results: [] } }))
                ]);

                const newItems = [
                    ...(allResM?.data?.results || []).map(m => ({ ...m, media_type: 'movie' })),
                    ...(allResT?.data?.results || []).map(t => ({ ...t, media_type: 'tv' }))
                ].filter(i => i.poster_path);

                if (newItems.length === 0) {
                    setHasMore(false);
                } else {
                    setAllContent(prev => [...prev, ...newItems]);
                }
            } catch (err) {
                console.error("Fetch More Error:", err);
            }
            setFetchingMore(false);
        };

        fetchMore();
    }, [page, config.companyId]);

    if (loading && !hero) return (
        <div className="h-screen flex items-center justify-center bg-black">
            <div className={`w-12 h-12 border-4 ${config.color.replace('text', 'border')} border-t-transparent rounded-full animate-spin`}></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] pb-32">
            {/* Cinematic Hero Section */}
            {hero && (
                <div className="relative h-[80vh] w-full flex items-end">
                    <div className="absolute inset-0">
                        <img
                            src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/original${hero.backdrop_path}`}
                            alt={hero.title || hero.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent z-10" />
                        <div className={`absolute inset-0 bg-gradient-to-r ${config.bg}/40 to-transparent mix-blend-overlay z-10`} />
                    </div>

                    <div className="relative z-20 p-6 md:p-12 w-full max-w-3xl mb-24 md:mb-32 animate-in slide-in-from-bottom-10 duration-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`h-1 w-12 ${config.color.replace('text', 'bg')} rounded-full shadow-neon`} />
                            <h1 className={`text-4xl md:text-6xl font-black italic tracking-tighter uppercase ${config.color} drop-shadow-2xl`}>
                                {config.logo}
                            </h1>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">{hero.title || hero.name}</h2>
                        <p className="text-zinc-300 line-clamp-3 mb-8 text-sm md:text-base max-w-xl leading-relaxed">{hero.overview}</p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handlePlay(hero)}
                                className="bg-white text-black px-10 py-3 rounded-md font-extrabold flex items-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                <Play fill="black" size={20} /> Watch Now
                            </button>
                            <button
                                onClick={() => onMoreInfo(hero)}
                                className="glass-panel text-white px-8 py-3 rounded-md font-bold flex items-center gap-2 hover:bg-white/10 transition-all border border-white/10"
                            >
                                <Info size={20} /> Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Specialized Chronological Rows */}
            <div className="relative z-30 -mt-16 space-y-20">
                {rows.map((row, idx) => (
                    <div key={idx} className="pl-4 md:pl-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`h-6 w-1 ${config.color.replace('text', 'bg')} rounded-full shadow-neon`} />
                            <h3 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter">{row.title}</h3>
                        </div>
                        <div className="flex gap-6 overflow-x-auto no-scrollbar pb-8 pr-4">
                            {row.items.map((item) => (
                                <div key={item.id} onClick={() => onMoreInfo(item)} className="poster-hover shrink-0 w-40 md:w-60 aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5 relative group transition-all">
                                    <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title || item.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-4">
                                        <div className="w-full">
                                            <h4 className="text-white font-black text-xs uppercase italic line-clamp-2">{item.title || item.name}</h4>
                                            <div className="h-0.5 w-0 group-hover:w-full bg-neon-cyan transition-all duration-700 mt-2" />
                                        </div>
                                    </div>
                                    <div className={`absolute inset-0 border-2 border-transparent group-hover:border-neon-cyan/20 rounded-2xl transition-all pointer-events-none`} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* THE VAULT: Extensive Grid Section */}
                <div className="px-4 md:px-12 pt-10">
                    <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className={`h-8 w-1.5 ${config.color.replace('text', 'bg')} rounded-full shadow-neon`} />
                            <div>
                                <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Watched Archives</h3>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Deep Dive Extraction</p>
                            </div>
                        </div>
                        <div className="hidden md:block h-px flex-1 bg-white/5 mx-10" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
                        {allContent.map((item, index) => (
                            <div
                                key={item.id}
                                ref={allContent.length === index + 1 ? lastElementRef : null}
                                onClick={() => onMoreInfo(item)}
                                className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/20 transition-all hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                            >
                                <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title || item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                                    <span className="font-black text-[10px] uppercase italic text-white/90 drop-shadow-md">{item.title || item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {fetchingMore && (
                        <div className="flex justify-center p-10">
                            <Loader2 className={`w-10 h-10 animate-spin ${config.color}`} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniversePage;