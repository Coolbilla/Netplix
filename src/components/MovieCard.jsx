// src/components/MoreInfoModal.jsx
import React, { useEffect, useState } from 'react';
import { neuralFetch, IMAGE_BASE } from '../utils/neuralFetch';
import { X, Play, Plus, ChevronDown, Check } from 'lucide-react';

const MoreInfoModal = ({ media, onClose, onPlay, onAddToList, user }) => {
    const [details, setDetails] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [activeSeason, setActiveSeason] = useState(1);



    useEffect(() => {
        const fetchFullDetails = async () => {
            try {
                const type = media.media_type || (media.first_air_date ? 'tv' : 'movie');

                // We can actually fetch basic details and the FIRST season 
                // at the same time if it's a TV show to make it feel instant.
                const { data } = await neuralFetch(
                    `/${type}/${media.id}?append_to_response=videos,credits,recommendations`
                );

                setDetails({ ...data, media_type: type });
                setRecommendations(data.recommendations?.results || []);

                // If it's a TV show, pre-load the first season episodes immediately
                if (type === 'tv') {
                    const epRes = await neuralFetch(`/tv/${media.id}/season/1`);
                    setEpisodes(epRes.data.episodes);
                }
            } catch (err) {
                console.error("Neural Link Failed:", err);
            }
        };
        fetchFullDetails();
    }, [media]);

    useEffect(() => {
        if (details?.media_type === 'tv') {
            neuralFetch(`/tv/${media.id}/season/${activeSeason}`)
                .then(res => setEpisodes(res.data.episodes))
                .catch(err => console.error(err));
        }
    }, [details, activeSeason]);

    if (!details) return null;
    const inWatchlist = user?.watchlist?.some(item => item.id === details.id);

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex justify-center overflow-y-auto no-scrollbar pt-10 pb-10 px-4">
            <div className="bg-[#181818] w-full max-w-4xl rounded-xl relative overflow-hidden h-fit shadow-2xl border border-white/10">
                <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full hover:bg-zinc-800 transition-colors"><X size={24} /></button>

                <div className="relative h-[400px]">
                    <img
                        src={`${IMAGE_BASE}/original${details.backdrop_path}`}
                        className="w-full h-full object-cover"
                        alt=""
                        onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.classList.add('bg-zinc-800', 'flex', 'items-center', 'justify-center');
            e.target.parentNode.innerHTML = '<span class="text-[10px] text-zinc-500">OFFLINE</span>';
        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
                    <div className="absolute bottom-8 left-8 z-10">
                        <h2 className="text-4xl font-black mb-6">{details.title || details.name}</h2>
                        <div className="flex gap-4">
                            <button onClick={() => onPlay(details)} className="bg-white text-black px-10 py-2.5 rounded font-bold flex items-center gap-2 hover:bg-zinc-200 transition-transform active:scale-95">
                                <Play fill="black" size={20} /> Play
                            </button>
                            <button onClick={() => onAddToList(details)} className={`p-2.5 border-2 rounded-full transition-all ${inWatchlist ? 'bg-red-600 border-red-600' : 'border-zinc-500 hover:border-white'}`}>
                                {inWatchlist ? <Check size={20} /> : <Plus size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center gap-4 text-green-500 font-bold">
                            <span>{(details.vote_average * 10).toFixed(0)}% Match</span>
                            <span className="text-zinc-400 border border-zinc-600 px-2 text-xs py-0.5 rounded">{details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0]}</span>
                        </div>
                        <p className="text-lg leading-relaxed text-zinc-300">{details.overview}</p>
                    </div>
                    <div className="text-sm space-y-4">
                        <p><span className="text-zinc-500">Cast:</span> {details.credits?.cast.slice(0, 4).map(c => c.name).join(', ')}</p>
                        <p><span className="text-zinc-500">Genres:</span> {details.genres?.map(g => g.name).join(', ')}</p>
                    </div>
                </div>

                {/* REAL EPISODES LIST */}
                {details.media_type === 'tv' && (
                    <div className="p-8 border-t border-white/10 bg-[#141414]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold">Episodes</h3>
                            <select value={activeSeason} onChange={(e) => setActiveSeason(e.target.value)} className="bg-zinc-800 text-white px-4 py-2 rounded border border-zinc-700 outline-none">
                                {details.seasons?.filter(s => s.season_number > 0).map(s => (
                                    <option key={s.id} value={s.season_number}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            {episodes.map(ep => (
                                <div key={ep.id} onClick={() => onPlay({ ...details, season: activeSeason, episode: ep.episode_number })} className="flex items-center gap-4 p-4 rounded-lg bg-zinc-800/20 hover:bg-zinc-800 cursor-pointer group transition-colors">
                                    <span className="text-xl font-bold text-zinc-500 w-6">{ep.episode_number}</span>
                                    <div className="w-32 h-20 bg-zinc-700 rounded relative shrink-0 overflow-hidden">
                                        <img
                                            src={`${IMAGE_BASE}/w300${ep.still_path}`}
                                            className="w-full h-full object-cover"
                                            alt=""
                                            onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.classList.add('bg-zinc-800', 'flex', 'items-center', 'justify-center');
            e.target.parentNode.innerHTML = '<span class="text-[10px] text-zinc-500">OFFLINE</span>';
        }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play fill="white" size={20} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold">{ep.name}</p>
                                        <p className="text-xs text-zinc-400 line-clamp-1">{ep.overview}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* MORE LIKE THIS (Recommendations) */}
                <div className="p-8 border-t border-white/10">
                    <h3 className="text-2xl font-bold mb-6">More Like This</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {recommendations.slice(0, 6).map(rec => (
                            <div key={rec.id} onClick={() => { setDetails(null); onPlay(rec); }} className="bg-zinc-900 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                                <img
                                    src={`${IMAGE_BASE}/w500${rec.backdrop_path}`}
                                    className="w-full h-32 object-cover"
                                    alt=""
                                    onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentNode.classList.add('bg-zinc-800', 'flex', 'items-center', 'justify-center');
            e.target.parentNode.innerHTML = '<span class="text-[10px] text-zinc-500">OFFLINE</span>';
        }}
                                />
                                <div className="p-4"><p className="text-sm font-bold line-clamp-1">{rec.title || rec.name}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};