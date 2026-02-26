import React from 'react';
import ReactPlayer from 'react-player';
import { ChevronLeft, Zap, Activity } from 'lucide-react';

const NewLivePlayer = ({ channelName, streamUrl, onBack }) => {
    const [isSyncing, setIsSyncing] = React.useState(true);
    const [hasError, setHasError] = React.useState(false);

    return (
        <div className="min-h-screen bg-[#020617] pt-24 pb-32 px-4 md:px-12 relative overflow-hidden font-mono">
            <style>
                {`
                    @keyframes progress-load {
                        0% { width: 0%; }
                        50% { width: 70%; }
                        100% { width: 100%; }
                    }
                    .animate-progress-load { animation: progress-load 3s ease-in-out infinite; }
                `}
            </style>

            <div className="max-w-[1400px] mx-auto relative z-10">
                {/* Header */}
                <header className="flex items-center gap-6 mb-8 border-b border-white/5 pb-6">
                    <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-neon-cyan transition-all border border-white/5 shadow-lg active:scale-95">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <p className="text-[10px] font-black text-neon-cyan uppercase tracking-widest mb-1">Direct Signal Entry</p>
                        <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase">
                            {channelName || "Satellite Feed"}
                        </h2>
                    </div>
                </header>

                {/* THE PLAYER CORE */}
                <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden border border-cyan-500/20 bg-black shadow-[0_0_50px_rgba(0,255,255,0.1)] group">
                    {/* LOADING OVERLAY */}
                    {isSyncing && !hasError && (
                        <div className="absolute inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center gap-6">
                            <Activity size={40} className="text-neon-cyan animate-pulse opacity-20" />
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.8em] animate-pulse">Syncing_Signal</p>
                                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-neon-cyan animate-progress-load" />
                                </div>
                            </div>
                        </div>
                    )}

                    <ReactPlayer
                        url={streamUrl}
                        playing={true}
                        controls={true}
                        width="100%"
                        height="100%"
                        playsinline
                        onReady={() => setIsSyncing(false)}
                        onStart={() => setIsSyncing(false)}
                        onBuffer={() => setIsSyncing(true)}
                        onBufferEnd={() => setIsSyncing(false)}
                        onError={(e) => {
                            console.error("Signal Error:", e);
                            setHasError(true);
                            setIsSyncing(false);
                        }}
                        style={{ position: 'absolute', top: 0, left: 0 }}
                        config={{
                            file: {
                                forceHLS: true,
                                hlsOptions: {
                                    enableWorker: true,
                                    lowLatencyMode: true,
                                    xhrSetup: function (xhr) {
                                        xhr.withCredentials = false;
                                    },
                                },
                                attributes: {
                                    crossOrigin: "anonymous"
                                }
                            }
                        }}
                    />
                </div>

                <div className="mt-8 flex items-center gap-3 text-zinc-500">
                    <Zap size={14} className="text-neon-cyan" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                        {hasError ? "Signal_Lost // Auto-Scan Pending" : "Status: Encryption Active // Sync: Stable"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NewLivePlayer;