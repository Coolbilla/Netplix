import React, { useState, useEffect } from 'react';
import {
    LogOut, Heart, Clock, User as UserIcon, Settings,
    Shield, Crown, CheckCircle, ChevronDown, Globe,
    Edit2, X, Sparkles, Activity, ShieldAlert, Zap, TrendingUp,
    ChevronLeft, ChevronRight, Upload
} from 'lucide-react';
import { getAuth, signOut, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { neuralFetch } from '../utils/neuralFetch';

const AVATARS = [
    "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
    "https://pro2-bar-s3-cdn-cf1.myportfolio.com/dddb0c1b4ab622854dd81280840458d3/98032aebff601c1d993e12a0_rw_600.png",
    "https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-qo9h82134t9nv0j0.jpg",
    "https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg",
    "https://pro2-bar-s3-cdn-cf1.myportfolio.com/dddb0c1b4ab622854dd81280840458d3/877ad1ce3a479ef9498e1efc_rw_600.png"
];

const GENRES = [
    "Action", "Adventure", "Animation", "Anime", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History", "Horror",
    "Music", "Mystery", "Romance", "Sci-Fi", "Thriller", "Western"
];

const StatCard = ({ icon, label, value, color, unit }) => {
    const isPurple = color === 'purple';
    return (
        <div className={`glass-panel p-8 rounded-3xl border-white/5 flex items-center gap-6 transition-all group bg-white/[0.01] ${isPurple ? 'hover:border-neon-purple/30' : 'hover:border-neon-cyan/30'}`}>
            <div className={`p-4 rounded-2xl transition-all ${isPurple ? 'bg-neon-purple/10 text-neon-purple group-hover:shadow-neon-purple' : 'bg-neon-cyan/10 text-neon-cyan group-hover:shadow-neon'}`}>
                {icon}
            </div>
            <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-3xl font-black italic text-white leading-none">{value || 0} <span className="text-[10px] not-italic text-zinc-600 ml-1">{unit}</span></p>
            </div>
        </div>
    );
};

const NeuralFeed = ({ userRegion = 'US' }) => {
    const [localTrends, setLocalTrends] = useState([]);
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        const fetchSectorData = async () => {
            setStatus('scanning');
            try {
                const { data } = await neuralFetch('/discover/movie', {
                    region: userRegion,
                    watch_region: userRegion,
                    sort_by: 'popularity.desc',
                    with_origin_country: userRegion
                });

                const results = data.results.length >= 5
                    ? data.results.slice(0, 5)
                    : (await neuralFetch('/trending/all/day')).data.results.slice(0, 5);

                setLocalTrends(results);
                setStatus('locked');
            } catch (err) {
                console.error("Neural Feed Interrupted:", err);
                setStatus('idle');
            }
        };

        fetchSectorData();
    }, [userRegion]);

    return (
        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-white/[0.01] relative overflow-hidden h-full">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${status === 'scanning' ? 'bg-neon-cyan/20 text-neon-cyan animate-pulse' : 'bg-neon-purple/20 text-neon-purple'}`}>
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Sector Intelligence</h3>
                        <p className="text-[8px] text-zinc-600 font-mono">LOCATION_ID: {userRegion} // STATUS: {status.toUpperCase()}</p>
                    </div>
                </div>
                <Activity size={20} className="text-zinc-800 animate-pulse" />
            </div>

            <div className="space-y-4">
                {localTrends.map((item, idx) => (
                    <div key={item.id} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer">
                        <span className="text-zinc-800 font-black italic text-xl group-hover:text-neon-cyan transition-colors">0{idx + 1}</span>
                        <div className="flex-1">
                            <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-300 group-hover:text-white truncate">
                                {item.title || item.name}
                            </h4>
                            <div className="flex gap-3 mt-1">
                                <span className="text-[8px] text-zinc-600 font-bold uppercase">{item.media_type}</span>
                                <div className="h-2 w-[1px] bg-zinc-800" />
                                <span className="text-[8px] text-neon-cyan font-black italic uppercase">
                                    {Math.round(item.vote_average * 10)}% Match
                                </span>
                            </div>
                        </div>
                        <Zap size={14} className="text-zinc-800 group-hover:text-neon-purple transition-colors" />
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 pointer-events-none border-b border-neon-cyan/5 animate-scan opacity-20" />
        </div>
    );
};

// ADDED `setCurrentPage` to props so the Back button works!
const Profile = ({ user, onLogin, setCurrentPage }) => {
    const [activeSetting, setActiveSetting] = useState(null);
    const [showAvatarSelect, setShowAvatarSelect] = useState(false);
    const [saving, setSaving] = useState(false);

    const auth = getAuth();
    const db = getFirestore();

    const handleSecureLogin = (e) => {
        if (e) e.preventDefault();
        if (typeof onLogin === 'function') {
            onLogin();
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="glass-panel p-10 md:p-16 rounded-[3rem] border border-white/5 text-center max-w-xl animate-in fade-in zoom-in duration-700 relative z-10">
                    <div className="w-24 h-24 bg-neon-cyan/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-neon-cyan/20 shadow-neon">
                        <ShieldAlert className="text-neon-cyan" size={48} />
                    </div>
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-6">Unauthorized Access</h2>
                    <p className="text-zinc-500 text-sm md:text-base mb-12 leading-relaxed italic uppercase tracking-widest opacity-80">
                        Secure uplink required. Please initialize connection to synchronize your archive and playback history.
                    </p>
                    <button
                        onClick={handleSecureLogin}
                        className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-neon-cyan transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-neon-cyan text-xs tracking-[0.3em] cursor-pointer"
                    >
                        ESTABLISH CONNECTION
                    </button>
                </div>
            </div>
        );
    }

    const handleLogout = () => signOut(auth);
    const toggleSetting = (setting) => setActiveSetting(activeSetting === setting ? null : setting);

    const handleUpdateAvatar = async (url) => {
        setSaving(true);
        try {
            await updateProfile(auth.currentUser, { photoURL: url });
            await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
            setShowAvatarSelect(false);
            window.location.reload();
        } catch (error) { console.error("Error updating avatar:", error); }
        setSaving(false);
    };

    // --- 🚀 100% FREE IMGBB UPLOAD (NO FIREBASE BILLING) ---
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload a valid image file.');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("image", file);
            
            // Your Personal ImgBB API Key
            const IMGBB_API_KEY = "8f4532adb65b0ba72670bdd6ff433d05"; 
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST",
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                const downloadURL = data.data.url;
                await handleUpdateAvatar(downloadURL); // Saves URL to your free Firestore!
            } else {
                throw new Error("ImgBB server rejected the image.");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            alert("Upload failed! Please check your internet connection and try again.");
            setSaving(false);
        }
    };

    const toggleGenre = async (genre) => {
        const currentPrefs = user.preferences || [];
        const newPrefs = currentPrefs.includes(genre)
            ? currentPrefs.filter(g => g !== genre)
            : [...currentPrefs, genre];
        try {
            await setDoc(doc(db, "users", user.uid), { preferences: newPrefs }, { merge: true });
        } catch (error) { console.error("Error updating preferences:", error); }
    };

    return (
        <div className="min-h-screen bg-[#020617] pt-28 pb-32 px-6 md:px-12 relative overflow-hidden">
            <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-[-5%] w-[500px] h-[500px] bg-neon-purple/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto flex flex-col gap-6 relative z-10">
                
                {/* --- NEW: BACK BUTTON --- */}
                <button 
                    onClick={() => setCurrentPage ? setCurrentPage('Home') : window.history.back()}
                    className="flex items-center gap-2 text-zinc-500 hover:text-neon-cyan transition-colors w-fit group cursor-pointer"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                </button>

                {/* 1. Profile HUD Header */}
                <div className="glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden bg-white/[0.01]">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Activity size={120} /></div>

                    <div className="relative group cursor-pointer flex-shrink-0" onClick={() => setShowAvatarSelect(true)}>
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl overflow-hidden border-2 border-neon-cyan shadow-neon group-hover:opacity-50 transition-all duration-500 bg-zinc-900">
                            <img 
                                src={user?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || user?.email}&backgroundColor=0f172a`} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-neon-cyan p-3 rounded-full text-black shadow-neon"><Edit2 size={20} /></div>
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <div className="h-px w-8 bg-neon-cyan" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Verified Identity</h3>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-2 leading-none truncate">
                            {user?.username || user?.displayName || user?.email?.split('@')[0]}
                        </h1>
                        <p className="text-zinc-500 text-xs mb-8 font-bold tracking-widest uppercase opacity-60">{user?.email}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <span className="flex items-center gap-2 bg-neon-purple/20 text-white text-[9px] uppercase font-black tracking-[0.2em] px-4 py-1.5 rounded-full border border-neon-purple/30 shadow-neon-purple">
                                <Crown size={12} className="text-neon-purple" /> Elite Member
                            </span>
                            <span className="flex items-center gap-2 glass-panel text-zinc-400 text-[9px] uppercase font-black tracking-[0.2em] px-4 py-1.5 rounded-full border-white/10">
                                <CheckCircle size={12} className="text-neon-cyan" /> System Active
                            </span>
                        </div>
                    </div>

                    <button onClick={handleLogout} className="md:absolute top-10 right-10 flex items-center gap-2 glass-button text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 group cursor-pointer">
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Disconnect
                    </button>
                </div>

                {/* 2. Stats & Neural Feed Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <StatCard icon={<Heart size={28} />} label="Stored Archive" value={user?.watchlist?.length} color="cyan" unit="Entries" />
                        <StatCard icon={<Clock size={28} />} label="Total Runtime" value={user?.history?.length} color="purple" unit="Cycles" />
                    </div>
                    <div className="lg:col-span-2">
                        <NeuralFeed userRegion={user.region || 'US'} />
                    </div>
                </div>

                {/* 3. Settings Interface */}
                <div className="space-y-4 mt-4">
                    <div className="flex flex-col gap-4">
                        {/* GENRE PREFERENCES */}
                        <div className="glass-panel rounded-3xl border-white/5 overflow-hidden transition-all duration-500 bg-white/[0.01]">
                            <div onClick={() => toggleSetting('preferences')} className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02]">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-neon-purple/10 rounded-xl text-neon-purple"><Sparkles size={20} /></div>
                                    <div>
                                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Content Bias</h3>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">Recalibrate recommendation logic</p>
                                    </div>
                                </div>
                                <ChevronDown size={20} className={`text-zinc-600 transition-transform duration-500 ${activeSetting === 'preferences' ? 'rotate-180 text-neon-cyan' : ''}`} />
                            </div>
                            {activeSetting === 'preferences' && (
                                <div className="p-8 pt-0 border-t border-white/5 bg-black/20">
                                    <div className="flex flex-wrap gap-3 mt-6">
                                        {GENRES.map((genre) => {
                                            const isSelected = user.preferences?.includes(genre);
                                            return (
                                                <button key={genre} onClick={() => toggleGenre(genre)}
                                                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all active:scale-90 border cursor-pointer ${isSelected
                                                        ? 'bg-neon-purple text-white border-none shadow-neon-purple'
                                                        : 'glass-panel border-white/10 text-zinc-500 hover:border-white/30'
                                                        }`}>
                                                    {genre}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- NEW: COMPACT, SCROLL-FREE REGION INTERFACE --- */}
                        <div className="glass-panel rounded-3xl border-white/5 overflow-hidden transition-none bg-white/[0.01]">
                            <div onClick={() => toggleSetting('region')} className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02]">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-neon-cyan/10 rounded-xl text-neon-cyan"><Globe size={20} /></div>
                                    <div>
                                        <h3 className="text-white font-black text-sm uppercase tracking-wider">Sector Uplink</h3>
                                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-tight">Geographic Data Source</p>
                                    </div>
                                </div>
                                <ChevronDown size={20} className={`text-zinc-600 transition-transform duration-500 ${activeSetting === 'region' ? 'rotate-180 text-neon-cyan' : ''}`} />
                            </div>

                            {activeSetting === 'region' && (
                                <div className="p-8 pt-0 border-t border-white/5 bg-black/20">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Active Sector</p>
                                            <p className="text-2xl font-black text-white italic tracking-widest uppercase">{user.region || 'US'}</p>
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage && setCurrentPage('Country')}
                                            className="px-8 py-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all active:scale-95 flex items-center gap-3 group whitespace-nowrap"
                                        >
                                            Modify Sector Data <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACCOUNT INTERFACE */}
                        <div className="glass-panel rounded-3xl border-white/5 overflow-hidden transition-all duration-500 bg-white/[0.01]">
                            <div onClick={() => toggleSetting('account')} className="flex items-center justify-between p-6 cursor-pointer hover:bg-white/[0.02]">
                                <div className="flex items-center gap-5">
                                    <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400"><UserIcon size={20} /></div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-wider">Access Node</h3>
                                </div>
                                <ChevronDown size={20} className={`text-zinc-600 transition-transform ${activeSetting === 'account' ? 'rotate-180' : ''}`} />
                            </div>
                            {activeSetting === 'account' && (
                                <div className="p-8 pt-0 border-t border-white/5 space-y-4 bg-black/20">
                                    <div className="flex justify-between items-center mt-6">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Auth Protocol</span>
                                        <span className="text-sm font-black text-neon-cyan italic">Neural DB Uplink</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global ID</span>
                                        <span className="text-[10px] font-mono text-zinc-400 select-all">{user.uid}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* AVATAR SELECTION MODAL */}
            {showAvatarSelect && (
                <div className="fixed inset-0 z-[600] bg-[#020617]/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in">
                    <div className="glass-panel p-8 md:p-12 rounded-[3rem] max-w-xl w-full border-white/10 relative shadow-2xl bg-[#0a0a0a] overflow-hidden">
                        <button onClick={() => setShowAvatarSelect(false)} className="absolute top-8 right-8 glass-button p-2 rounded-full text-zinc-500 hover:text-white cursor-pointer z-50"><X size={20} /></button>
                        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-8">Sync <span className="text-neon-cyan">Identity</span></h2>
                        
                        {/* --- NEW: FREE IMGBB UPLOAD ZONE --- */}
                        <div className="mb-8 relative group cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={saving}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                            />
                            <div className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all ${saving ? 'border-neon-cyan/50 bg-neon-cyan/5' : 'border-white/10 group-hover:border-neon-cyan/50 group-hover:bg-neon-cyan/5'}`}>
                                <Upload size={32} className={`mb-3 transition-colors ${saving ? 'text-neon-cyan animate-bounce' : 'text-zinc-500 group-hover:text-neon-cyan'}`} />
                                <span className="text-[12px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                                    {saving ? 'Transmitting...' : 'Upload Custom Image'}
                                </span>
                                <span className="text-[9px] text-zinc-600 uppercase tracking-widest mt-2">Max Size: 32MB</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-8 opacity-60">
                            <div className="h-px w-full bg-white/10" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 whitespace-nowrap">Or select preset</span>
                            <div className="h-px w-full bg-white/10" />
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            {AVATARS.map((url, idx) => (
                                <div key={idx} onClick={() => !saving && handleUpdateAvatar(url)}
                                    className={`aspect-square rounded-[1rem] overflow-hidden cursor-pointer border-2 transition-all hover:scale-110 ${user.photoURL === url ? 'border-neon-cyan shadow-neon' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                                    <img src={url} alt="ID" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        {saving && <p className="text-center text-neon-cyan font-black text-[10px] uppercase tracking-[0.4em] mt-8 animate-pulse">Uploading to Neural Network...</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
