import React, { useState, useEffect, useCallback, useRef } from 'react';
import { neuralFetch } from './utils/neuralFetch';
import { Search as SearchIcon, Bell, X, LogOut, Tv, Film, Sparkles, Radio, Zap, Users } from 'lucide-react';

// Core Components
import Player from './components/Player';
import Home from './pages/Home';
import MyList from './pages/MyList';
import Profile from './pages/Profile';
import NotLoggedIn from './pages/NotLoggedIn'; 
import Movies from './pages/Movies';
import Series from './pages/Series';
import AnimeHub from './pages/AnimeHub';
import Country from './pages/Country';
import UniversePage from './pages/UniversePage';
import Notifications from './pages/Notifications';
import StudioHub from './components/StudioHub';
import MobileMoreInfoModal from './components/MobileMoreInfoModal';
import MoreInfoModal from './components/MoreInfoModal';
import VibeSearch from './components/VibeSearch';
import Search from './pages/Search';
import LiveTV from './pages/LiveTV';
import TVMoreInfo from './tv/TVMoreInfo';
import CustomLivePlayer from './components/CustomLivePlayer';
import { useBackButtonInterceptor } from './hooks/useBackButtonInterceptor'; 
import NetplixIntro from './components/Intro';
import FooterNav from './components/FooterNav';
import InstallButton from './components/InstallButton';
import Navbar from './components/Navbar';
import MobileHeader from './components/MobileHeader'; 

// --- CUSTOM AUTH POPUP ---
import AuthModal from './components/AuthModal';

// --- AIR-GAP: NEW TV APP IMPORT ---
import TVApp from './tv/TVApp';

// Party Watch System
import PartyLobby from './pages/PartyLobby';
import PartyRoom from './pages/PartyRoom';
import PartyToast from "./components/Party/PartyToast";

// Firebase Imports
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { discordSdk } from "./discord";

const playNeuralTone = (type = 'start') => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.setValueAtTime(type === 'start' ? 880 : 440, ctx.currentTime);
  osc.type = 'sine';

  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.5);
};

const App = () => {
  useEffect(() => {
    const setupDiscordActivity = async () => {
      if (!discordSdk) return;
      try {
        await discordSdk.ready();
        console.log("Discord SDK Initialized! Running inside Voice Channel 🚀");
      } catch (err) {
        console.error("Discord setup failed:", err);
      }
    };
    setupDiscordActivity();
  }, []);
  
  const [showIntro, setShowIntro] = useState(true);
  const [currentPage, setCurrentPage] = useState('Home');
  const [activeTab, setActiveTab] = useState('home');
  const [category, setCategory] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroMovie, setHeroMovie] = useState(null);
  const [trending, setTrending] = useState([]);
  const [activeMedia, setActiveMedia] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [continueWatching, setContinueWatching] = useState([]);
  const [selectedMoreInfo, setSelectedMoreInfo] = useState(null);
  const [isVibeSearchOpen, setIsVibeSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [isGlobalListening, setIsGlobalListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsGlobalListening(true);
        playNeuralTone('start'); 
      };

      recognitionRef.current.onresult = (event) => {
        if (event.results.length > 0) {
          const result = event.results[0][0].transcript;
          setVoiceTranscript(result);
        }
        playNeuralTone('end'); 
        setIsGlobalListening(false);
      };

      recognitionRef.current.onerror = () => setIsGlobalListening(false);
      recognitionRef.current.onend = () => setIsGlobalListening(false);
    }
  }, []);

  const toggleGlobalVoice = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Neural Voice Interface not supported in this browser.");
      return;
    }

    if (isGlobalListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Voice start error", err);
        setIsGlobalListening(false);
      }
    }
  }, [isGlobalListening]);

  useBackButtonInterceptor(!!activeMedia, () => setActiveMedia(null));
  useBackButtonInterceptor(!!selectedMoreInfo, () => setSelectedMoreInfo(null));
  useBackButtonInterceptor(isSearchOpen, () => setIsSearchOpen(false));
  useBackButtonInterceptor(isVibeSearchOpen, () => setIsVibeSearchOpen(false));

  const [isTVMode, setIsTVMode] = useState(false);
  const [activePartyId, setActivePartyId] = useState(null);
  const [partyMedia, setPartyMedia] = useState(null);
  const [activeStream, setActiveStream] = useState({ name: 'Sky Sports F1', code: 'gb', url: '', image: '' });
  const [liveChannelsMatrix, setLiveChannelsMatrix] = useState({});

  const categories = [
    { name: 'All', icon: <Sparkles size={16} /> },
    { name: 'Movies', icon: <Film size={16} />, type: 'movie' },
    { name: 'TV Series', icon: <Tv size={16} />, type: 'tv' },
    { name: 'Anime', icon: <Zap size={16} />, type: 'tv' },
    { name: 'Live TV', icon: <Radio size={16} /> },
  ];

  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isSmartTV = /smart-tv|tizen|webos|hbbtv|appletv|googletv|firetv/i.test(ua);
      const isBigScreen = window.innerWidth >= 1920;
      setIsMobile(window.innerWidth < 768);
      setIsTVMode(isSmartTV || isBigScreen);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleRemoteInput = (e) => {
      const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const elements = Array.from(document.querySelectorAll(focusable));
      const currIdx = elements.indexOf(document.activeElement);

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        document.body.classList.add('is-navigating-via-remote');
      }

      if (e.key === 'Backspace' || e.key === 'Escape') {
        if (currentPage !== 'Home') setCurrentPage('Home');
      }
    };

    window.addEventListener('keydown', handleRemoteInput);
    return () => window.removeEventListener('keydown', handleRemoteInput);
  }, [currentPage]);

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      const focusable = document.querySelector('button, [href], input, [tabindex="0"]');
      if (focusable && !isMobile) {
        focusable.focus();
        document.body.classList.add('is-navigating-via-remote');
      }
    }, 500); 
    return () => clearTimeout(focusTimer);
  }, [currentPage, activeTab]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const unsubStore = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setContinueWatching(data.history || []);
            setUser(prev => ({
              ...prev,
              watchlist: data.watchlist || [],
              history: data.history || [],
              preferences: data.preferences || [],
              completed: data.completed || [],
              region: data.region || 'US',
              username: data.username 
            }));
          }
        });
        const unsubSentiments = onSnapshot(collection(db, "users", currentUser.uid, "sentiments"), (snapshot) => {
          const sentimentData = {};
          snapshot.forEach(doc => { sentimentData[doc.id] = doc.data().type; });
          setUser(prev => ({ ...prev, sentiments: sentimentData }));
        });
        return () => { unsubStore(); unsubSentiments(); };
      } else {
        setContinueWatching([]);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trendingRes = await neuralFetch(`/trending/all/week`);
        setTrending(trendingRes.data.results || []);
        setHeroMovie(trendingRes.data.results?.[Math.floor(Math.random() * (trendingRes.data.results?.length || 0))] || null);
      } catch (err) {
        console.error("Data Fetch Error:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const delayDebounce = setTimeout(async () => {
      try {
        const activeCat = categories.find(c => c.name === category);
        let url = `/search/multi?query=${searchQuery}`;
        if (activeCat?.type && category !== 'All') {
          url = `/search/${activeCat.type}?query=${searchQuery}`;
        }
        const { data } = await neuralFetch(url);
        let results = data.results?.filter(m => m.poster_path) || [];
        if (category === 'Anime') {
          results = results.filter(m => m.genre_ids?.includes(16));
        }
        setSearchResults(results);
      } catch (err) { console.error(err); }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, category]);

  useEffect(() => {
    const handleDeepLink = () => {
      const path = window.location.pathname;
      if (path.startsWith('/party/')) {
        const idFromUrl = path.split('/party/')[1];
        if (idFromUrl) {
          setActivePartyId(idFromUrl);
          setCurrentPage('PartyRoom');
        }
      }
    };

    handleDeepLink();
    window.addEventListener('popstate', handleDeepLink);
    return () => window.removeEventListener('popstate', handleDeepLink);
  }, []);

  useEffect(() => {
    if (currentPage === 'Home') setActiveTab('home');
    if (currentPage === 'Party') setActiveTab('party');
    if (currentPage === 'LiveTV') setActiveTab('live');
    if (currentPage === 'F1Universe') setActiveTab('f1');
    if (currentPage === 'MyList') setActiveTab('list');
  }, [currentPage]);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handlePlay = async (media) => {
    if (media.isParty) {
      setActivePartyId(media.partyId);
      setCurrentPage('PartyRoom');
      return;
    }

    const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');
    const savedProgress = continueWatching.find(h => h.id === media.id);
    const playData = {
      ...media,
      media_type: mediaType,
      season: media.startOver ? 1 : (media.season || savedProgress?.lastSeason || 1),
      episode: media.startOver ? 1 : (media.episode || savedProgress?.lastEpisode || 1)
    };
    setActiveMedia(playData);
    if (user) {
      const userRef = doc(db, "users", user.uid);
      const movieToStore = {
        id: media.id,
        title: media.title || media.name,
        poster_path: media.poster_path,
        backdrop_path: media.backdrop_path || savedProgress?.backdrop_path,
        media_type: mediaType,
        lastSeason: playData.season,
        lastEpisode: playData.episode,
        lastWatched: Date.now(),
        isAnime: currentPage === 'Anime' || media.genre_ids?.includes(16) || false
      };
      const updatedHistory = [movieToStore, ...continueWatching.filter(m => m.id !== media.id)].slice(0, 20);
      await setDoc(userRef, { history: updatedHistory }, { merge: true });
    }
  };

  const toggleWatchlist = async (media) => {
    if (!user) { handleLogin(); return; }
    const userRef = doc(db, "users", user.uid);
    const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');
    const isAnime = media.isAnime || media.genre_ids?.includes(16) || currentPage === 'Anime';
    const movieData = {
      id: media.id,
      title: media.title || media.name,
      poster_path: media.poster_path,
      media_type: mediaType,
      isAnime: !!isAnime
    };

    const isAdded = user.watchlist?.some(item => item.id === media.id);
    try {
      await setDoc(userRef, { watchlist: isAdded ? arrayRemove(movieData) : arrayUnion(movieData) }, { merge: true });
    } catch (err) { console.error("Watchlist Error:", err); }
  };

  const toggleCompleted = async (media) => {
    if (!user) { handleLogin(); return; }
    const userRef = doc(db, "users", user.uid);
    const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');
    const isAnime = media.isAnime || media.genre_ids?.includes(16) || currentPage === 'Anime';
    const movieData = { id: media.id, title: media.title || media.name, poster_path: media.poster_path, media_type: mediaType, isAnime: !!isAnime };

    const isCompleted = user.completed?.some(item => item.id === media.id);
    try {
      if (isCompleted) {
        await setDoc(userRef, { completed: arrayRemove(movieData) }, { merge: true });
      } else {
        await setDoc(userRef, { completed: arrayUnion(movieData) }, { merge: true });
        removeFromHistory(media.id); 
      }
    } catch (err) { console.error("Vault Error:", err); }
  };

  const removeFromHistory = async (id) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const updatedHistory = continueWatching.filter(m => m.id !== id);
      await setDoc(userRef, { history: updatedHistory }, { merge: true });
    } catch (err) { console.error("Remove History Error:", err); }
  };

  const handleMobileTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'home') {
      setCurrentPage('Home');
      setCategory('All');
      window.scrollTo(0, 0);
    } else if (tabId === 'party') {
      setCurrentPage('Party');
      window.scrollTo(0, 0);
    } else if (tabId === 'live') {
      setCurrentPage('LiveTV');
      window.scrollTo(0, 0);
    } else if (tabId === 'f1') {
      setCurrentPage('F1Universe');
      window.scrollTo(0, 0);
    } else if (tabId === 'list') {
      setCurrentPage('MyList');
      window.scrollTo(0, 0);
    } else if (tabId === 'search') {
      setIsSearchOpen(true);
    }
  };

  const handleTuneChannel = (channel) => {
    setActiveStream({
      name: channel?.name || 'Live Stream',
      url: channel?.url || '',
      image: channel?.image || '',
      code: channel?.country || channel?.code || 'us'
    });
    setCurrentPage('LivePlayer');
    window.scrollTo(0, 0);
  };

  const handleStartParty = (media) => {
    setSelectedMoreInfo(null);
    setPartyMedia(media);
    setCurrentPage('Party');
    window.scrollTo(0, 0);
  };

  const isPlayerActive = activeMedia || (currentPage === 'PartyRoom' && activePartyId);

  if (isTVMode) {
    return (
      <TVApp
        user={user}
        handlePlay={handlePlay}
        activeMedia={activeMedia}
        closePlayer={() => setActiveMedia(null)}
        onTuneChannel={handleTuneChannel}
        toggleCompleted={toggleCompleted}
      />
    );
  }

  // --- STRICT ROUTING RENDERER ---
  // This physically prevents two pages from being in the DOM at the same time.
  const renderCurrentPage = () => {
    if (isPlayerActive) return null; // Player handles its own overlay

    switch (currentPage) {
      case 'Home':
        return <Home continueWatching={continueWatching} user={user} handlePlay={handlePlay} onRemoveFromHistory={removeFromHistory} onMoreInfo={setSelectedMoreInfo} onJoinParty={(id) => { setActivePartyId(id); setCurrentPage('PartyRoom'); }} setCurrentPage={setCurrentPage} />;
      case 'Profile':
        return user ? <Profile user={user} setCurrentPage={setCurrentPage} /> : <NotLoggedIn onLogin={handleLogin} setCurrentPage={setCurrentPage} />;
      case 'Party':
        return <PartyLobby user={user} onJoinParty={(id) => { setActivePartyId(id); setCurrentPage('PartyRoom'); }} preselectedMedia={partyMedia} clearPreselectedMedia={() => setPartyMedia(null)} />;
      case 'LiveTV':
        return <LiveTV onTuneChannel={handleTuneChannel} categorizedChannels={liveChannelsMatrix} setCategorizedChannels={setLiveChannelsMatrix} />;
      case 'LivePlayer':
        return <CustomLivePlayer channelName={activeStream.name} streamUrl={activeStream.url} onBack={() => setCurrentPage('LiveTV')} setStreamUrl={(url) => setActiveStream(prev => ({ ...prev, url }))} setChannelName={(name) => setActiveStream(prev => ({ ...prev, name }))} categorizedSignals={liveChannelsMatrix} />;
      case 'Movies':
        return <Movies user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />;
      case 'Series':
        return <Series user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />;
      case 'Anime':
        return <AnimeHub user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />;
      case 'Country':
        return <Country user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />;
      case 'MyList':
        return <MyList user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />;
      case 'Marvel':
      case 'DC':
      case 'Disney':
      case 'StarWars':
        return <UniversePage type={currentPage.toLowerCase()} user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />;
      case 'Notifications':
        return <Notifications onMoreInfo={setSelectedMoreInfo} handlePlay={handlePlay} />;
      default:
        return <Home continueWatching={continueWatching} user={user} handlePlay={handlePlay} onRemoveFromHistory={removeFromHistory} onMoreInfo={setSelectedMoreInfo} onJoinParty={(id) => { setActivePartyId(id); setCurrentPage('PartyRoom'); }} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-neon-cyan/30 overflow-x-hidden relative">
      
      {showIntro && (
        <div className="fixed inset-0 z-[10000] bg-[#020617]">
          <NetplixIntro onComplete={() => setShowIntro(false)} />
        </div>
      )}

      {!isPlayerActive && (
        <div className="relative z-[9000]">
          <div className="md:hidden">
            <MobileHeader
              user={user}
              setCurrentPage={setCurrentPage}
              onSearchClick={() => setIsSearchOpen(true)}
              onVibeSearch={() => setIsVibeSearchOpen(true)}
              onLogin={handleLogin}
            />
          </div>
      
          <div className="hidden md:block">
            <Navbar
              user={user}
              onVibeSearch={() => setIsVibeSearchOpen(true)}
              onSearchClick={() => setIsSearchOpen(true)}
              setCurrentPage={setCurrentPage}
              setCategory={setCategory}
              onLogin={handleLogin}
            />
          </div>
        </div>
      )}

      <PartyToast user={user} onJoin={(id) => {
        setActivePartyId(id);
        setCurrentPage('PartyRoom');
        window.scrollTo(0, 0);
      }} />

      {/* THE MAIN CONTENT AREA */}
      <main className={`relative animate-in fade-in duration-700 w-full ${ isPlayerActive ? 'z-[5000]' : ''} pt-0 pb-24 md:pb-0 min-h-screen`} >
        
        {/* Render the active page from the switch statement */}
        {renderCurrentPage()}

        {/* Global Overlays (Player and Party) */}
        {currentPage === 'PartyRoom' && activePartyId && <PartyRoom partyId={activePartyId} user={user} onLeave={() => { setActivePartyId(null); setCurrentPage('Party'); }} />}
        {activeMedia && !activePartyId && (
          <Player media={activeMedia} toggleCompleted={toggleCompleted} onClose={() => setActiveMedia(null)} />
        )}
      </main>

      {!isPlayerActive && (
        <FooterNav
          activeTab={activeTab}
          setActiveTab={handleMobileTabChange}
          setCategory={setCategory}
          setCurrentPage={setCurrentPage}
        />
      )}

      {selectedMoreInfo && (
        isTVMode ? (
          <TVMoreInfo media={selectedMoreInfo} onClose={() => setSelectedMoreInfo(null)} onPlay={(m) => { handlePlay(m); setSelectedMoreInfo(null); }} user={user} onAddToList={toggleWatchlist} toggleCompleted={toggleCompleted} />
        ) : isMobile ? (
          <MobileMoreInfoModal media={selectedMoreInfo} user={user} onClose={() => setSelectedMoreInfo(null)} onPlay={(m) => { if (m.isParty) { setActivePartyId(m.partyId); setCurrentPage('PartyRoom'); } else { handlePlay(m); } setSelectedMoreInfo(null); }} onAddToList={toggleWatchlist} onStartParty={handleStartParty} toggleCompleted={toggleCompleted} />
        ) : (
          <MoreInfoModal media={selectedMoreInfo} user={user} onClose={() => setSelectedMoreInfo(null)} onPlay={(m) => { if (m.isParty) { setActivePartyId(m.partyId); setCurrentPage('PartyRoom'); } else { handlePlay(m); } setSelectedMoreInfo(null); }} onAddToList={toggleWatchlist} onStartParty={handleStartParty} toggleCompleted={toggleCompleted} />
        )
      )}

      {isSearchOpen && (
        <Search
          onClose={() => setIsSearchOpen(false)}
          onSelectMedia={(m) => {
            setSelectedMoreInfo(m);
            setIsSearchOpen(false);
          }}
          voiceTranscript={voiceTranscript}
          isListening={isGlobalListening}
          toggleVoice={toggleGlobalVoice}
        />
      )}

      {isVibeSearchOpen && (
        <VibeSearch
          onClose={() => setIsVibeSearchOpen(false)}
          onPlay={handlePlay}
          onMoreInfo={(m) => { setSelectedMoreInfo(m); setIsVibeSearchOpen(false); }}
        />
      )}

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      <InstallButton />
    </div>
  );
};

export default App;
