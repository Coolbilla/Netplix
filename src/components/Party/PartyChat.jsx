import React, { useState, useEffect, useRef } from 'react';
import { Send, ShieldCheck, Zap, MessageSquare } from 'lucide-react';

const PartyChat = ({ messages, onSendMessage, user, hostId }) => {
    const [text, setText] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSendMessage(text);
        setText('');
    };

    return (
        <div className="flex flex-col h-full bg-[#020617]/60 backdrop-blur-2xl border-l border-white/5 relative overflow-hidden">

            {/* 1. Feed HUD Header */}
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-1 w-1 rounded-full bg-neon-cyan animate-pulse shadow-neon" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 italic">
                        Transmission Feed
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <MessageSquare size={12} className="text-zinc-600" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase">{messages.length}</span>
                </div>
            </div>

            {/* 2. Message Frequencies (The Grid) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 no-scrollbar relative z-10">
                {messages.map((msg, i) => {
                    const isMe = msg.userId === user?.uid;
                    const isHost = msg.userId === hostId;

                    return (
                        <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            {/* Metadata HUD */}
                            <div className="flex items-center gap-2 mb-2 px-1">
                                {isHost && <ShieldCheck size={10} className="text-neon-cyan shadow-neon" />}
                                <span className={`text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-neon-purple' : 'text-zinc-500'}`}>
                                    {isMe ? 'Local Signal' : msg.userName}
                                </span>
                            </div>

                            {/* Message Bubble - Holographic Glass */}
                            <div className={`
                                px-4 py-3 rounded-2xl text-[13px] max-w-[85%] break-words relative transition-all shadow-xl
                                ${isMe
                                    ? 'bg-neon-purple/20 border border-neon-purple/30 text-white rounded-tr-none'
                                    : 'glass-panel border-white/5 text-zinc-200 rounded-tl-none'
                                }
                            `}>
                                {msg.text}

                                {/* Subtle Glow for Host Messages */}
                                {isHost && !isMe && (
                                    <div className="absolute inset-0 bg-neon-cyan/5 blur-lg -z-10 rounded-full" />
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* 3. Input Protocol HUD */}
            <form onSubmit={handleSubmit} className="p-5 bg-white/[0.02] border-t border-white/5 relative z-20">
                <div className="relative group">
                    {/* Input Glow Layer */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-cyan/20 to-neon-purple/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />

                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Broadcast message..."
                            className="w-full bg-[#020617] border border-white/10 py-3.5 pl-5 pr-14 rounded-xl text-sm text-white placeholder:text-zinc-700 outline-none focus:border-neon-cyan/40 transition-all shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!text.trim()}
                            className="absolute right-2 p-2 rounded-lg text-neon-cyan hover:bg-neon-cyan/20 disabled:opacity-20 disabled:hover:bg-transparent transition-all transform active:scale-90"
                        >
                            <Send size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex justify-center">
                    <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Encrypted Data Stream</p>
                </div>
            </form>

            {/* Background Ambient Glimmer */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-neon-cyan/5 rounded-full blur-[60px] pointer-events-none" />
        </div>
    );
};

export default PartyChat;