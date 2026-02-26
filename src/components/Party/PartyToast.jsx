import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Note the double dot to go up two levels
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { Radio, X } from 'lucide-react';

const PartyToast = ({ onJoin, user }) => {
    const [activeToast, setActiveToast] = useState(null);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "parties"),
            where("settings.isPublic", "==", true),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const data = change.doc.data();
                    const isNew = (Date.now() - data.createdAt?.toMillis()) < 30000;

                    if (isNew && data.settings?.isPublic) {
                        setActiveToast({ id: change.doc.id, ...data });
                        setTimeout(() => setActiveToast(null), 8000);
                    }
                }
            });
        });

        return () => unsub();
    }, []);

    if (!activeToast) return null;

    return (
        <div className="fixed top-24 right-6 z-[200] w-80 bg-zinc-900/90 backdrop-blur-2xl border border-red-600/30 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-right-10 duration-500">
            <button onClick={() => setActiveToast(null)} className="absolute top-2 right-2 text-zinc-500 hover:text-white">
                <X size={14} />
            </button>
            <div className="flex gap-4">
                <img src={`https://images.weserv.nl/?url=https://image.tmdb.org/t/p/w200${activeToast.media.poster}`} className="w-12 h-18 rounded-lg object-cover" alt="" />
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Live Party</p>
                    <h4 className="text-sm font-bold text-white truncate mb-2">{activeToast.media.title}</h4>
                    <button
                        onClick={() => { onJoin(activeToast.id); setActiveToast(null); }}
                        className="w-full bg-white text-black py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                    >
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartyToast;