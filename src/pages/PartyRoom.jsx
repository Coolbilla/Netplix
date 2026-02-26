import React, { useRef, useState, useEffect } from 'react';
import { X, Send, Users, ShieldCheck, MessageSquare, Share2, Check, ChevronRight, ChevronLeft, Zap, Activity } from 'lucide-react';
import { usePartySync } from '../hooks/usePartySync';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit, doc, deleteDoc } from 'firebase/firestore';
import { copyPartyLink } from '../utils/shareParty';
import { sendReaction, leaveParty } from '../services/partyService';
import ReactionOverlay from '../components/Party/ReactionOverlay';
import PartyPlayer from '../components/PartyPlayer';
import PartyControls from '../components/Party/PartyControls';

const PartyRoom = ({ partyId, user, onLeave }) => {
    const playerRef = useRef(null);
    const scrollRef = useRef(null);
    const idleTimerRef = useRef(null);

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [activeReactions, setActiveReactions] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [showUI, setShowUI] = useState(true);

    const { partyData, isHost } = usePartySync(partyId, user?.uid, playerRef, () => {
        alert("This frequency has been terminated by the host.");
        onLeave();
    });

    const resetIdleTimer = () => {
        setShowUI(true);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        if (!isChatOpen) {
            idleTimerRef.current = setTimeout(() => setShowUI(false), 3000);
        }
    };

    useEffect(() => {
        window.addEventListener('mousemove', resetIdleTimer);
        window.addEventListener('keydown', resetIdleTimer);
        return () => {
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
        };
    }, [isChatOpen]);

    useEffect(() => {
        if (!partyId) return;
        const q = query(collection(db, "parties", partyId, "reactions"), orderBy("timestamp", "desc"), limit(10));
        const unsub = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const reaction = { id: change.doc.id, ...change.doc.data() };
                    setActiveReactions(prev => [...prev.slice(-15), reaction]);
                }
            });
        });
        return () => unsub();
    }, [partyId]);

    useEffect(() => {
        if (!partyId) return;
        const q = query(collection(db, "parties", partyId, "chat"), orderBy("timestamp", "asc"));
        const unsub = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        });
        return () => unsub();
    }, [partyId]);

    const handleInvite = async () => {
        const success = await copyPartyLink(partyId);
        if (success) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleCloseParty = async () => {
        if (!isHost) return;
        if (window.confirm("Terminate this hub? All users will be disconnected.")) {
            await deleteDoc(doc(db, "parties", partyId));
            onLeave();
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;
        await addDoc(collection(db, "parties", partyId, "chat"), {
            text: newMessage,
            userName: user.displayName || 'Guest',
            userId: user.uid,
            timestamp: serverTimestamp()
        });
        setNewMessage('');
    };

    if (!partyData) return null;

    return (
        <div
            className={`fixed inset-0 z-[100] bg-black overflow-hidden select-none transition-all duration-700 ${!showUI ? 'cursor-none' : ''}`}
            onMouseMove={resetIdleTimer}
        >
            {/* LAYER 0: THE PLAYER */}
            <div className="absolute inset-0 z-0">
                <PartyPlayer partyData={partyData} isHost={isHost} />
            </div>

            {/* LAYER 1: VIGNETTE */}
            <div className={`absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80 pointer-events-none transition-opacity duration-1000 ${showUI ? 'opacity-100' : 'opacity-0'}`} />

            {/* LAYER 2: TOP HUD */}
            <div className={`absolute top-0 inset-x-0 z-[60] p-8 transition-all duration-700 flex justify-between items-start pointer-events-none ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
                <div className="flex items-center gap-4 glass-panel px-6 py-3 rounded-2xl border-white/5 pointer-events-auto bg-black/40 backdrop-blur-md">
                    <button onClick={() => leaveParty(partyId, user, isHost).then(onLeave)} className="text-white/40 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-sm font-black italic uppercase tracking-tighter text-white">{partyData.media.title}</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse shadow-neon" />
                            <p className="text-[8px] font-black text-neon-cyan uppercase tracking-[0.2em]">{partyData.members?.length} Connected</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 pointer-events-auto">
                    <button onClick={handleInvite} className="glass-panel px-5 py-2.5 rounded-xl border-white/10 text-[10px] font-black uppercase text-white tracking-widest hover:border-white transition-all bg-black/40">
                        {isCopied ? <Check size={14} className="text-green-500" /> : <Share2 size={14} className="text-neon-cyan" />}
                        <span className="ml-2">{isCopied ? "COPIED" : "SHARE HUB"}</span>
                    </button>
                    {isHost && (
                        <button onClick={handleCloseParty} className="glass-panel px-5 py-2.5 rounded-xl border-red-500/20 text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white transition-all bg-black/40">
                            Terminate Hub
                        </button>
                    )}
                </div>
            </div>

            {/* LAYER 3: SIDEBAR BLADE TRIGGER */}
            <div className={`absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 items-center z-[70] transition-all duration-700 ${showUI && !isChatOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
                <div className="flex flex-col gap-4 p-2.5 glass-panel rounded-full border-white/5 bg-black/20">
                    {['🔥', '😂', '😮', '❤️'].map(emoji => (
                        <button key={emoji} onClick={() => sendReaction(partyId, emoji)} className="w-8 h-8 flex items-center justify-center hover:scale-125 transition-transform text-lg">
                            {emoji}
                        </button>
                    ))}
                </div>
                <button onClick={() => setIsChatOpen(true)} className="glass-panel p-4 rounded-3xl border-white/10 text-neon-purple shadow-neon-purple transition-all bg-black/40">
                    <MessageSquare size={20} />
                </button>
            </div>

            {/* LAYER 4: BOTTOM HUD (Controls only) */}
            <div className={`absolute bottom-0 inset-x-0 z-[60] p-10 transition-all duration-700 ${showUI ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                <div className="max-w-4xl mx-auto w-full glass-panel p-4 rounded-3xl border-white/5 backdrop-blur-3xl bg-black/40 pointer-events-auto">
                    <PartyControls partyData={partyData} isHost={isHost} onTogglePlay={() => { }} />
                </div>
            </div>

            {/* LAYER 5: CHAT ASIDE */}
            <aside className={`fixed top-0 right-0 h-full w-full md:w-[400px] bg-[#020617]/95 backdrop-blur-3xl border-l border-white/10 z-[100] transition-transform duration-700 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500">
                                <ChevronRight size={20} />
                            </button>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Live Feed</h3>
                        </div>
                        <Activity size={16} className="text-neon-cyan animate-pulse" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex flex-col ${msg.userId === user?.uid ? 'items-end' : 'items-start'}`}>
                                <span className="text-[9px] font-black text-zinc-600 uppercase mb-1 tracking-widest">{msg.userName}</span>
                                <div className={`px-4 py-3 rounded-2xl text-xs max-w-[85%] ${msg.userId === user?.uid ? 'bg-neon-purple text-white rounded-tr-none' : 'glass-panel border-white/10 text-zinc-300 rounded-tl-none bg-white/[0.03]'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-6 border-t border-white/5">
                        <div className="relative flex items-center group">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Broadcast to hub..."
                                className="w-full bg-white/[0.03] border border-white/10 py-4 pl-6 pr-14 rounded-2xl text-sm text-white outline-none focus:border-neon-cyan/40 transition-all shadow-2xl"
                            />
                            <button type="submit" className="absolute right-3 p-2 text-neon-cyan hover:scale-110 transition-transform">
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </aside>

            {/* REACTION OVERLAY */}
            <div className="absolute inset-0 z-10 pointer-events-none">
                <ReactionOverlay reactions={activeReactions} />
            </div>
        </div>
    );
};

export default PartyRoom;