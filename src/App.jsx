import React, { useState, useEffect, useCallback, useRef } from 'react';
import { neuralFetch } from './utils/neuralFetch';
import { Search as SearchIcon, Bell, X, LogOut, Tv, Film, Sparkles, Radio, Zap, Users } from 'lucide-react';

// Core Components
import Player from './components/Player';
import Home from './pages/Home';
import MyList from './pages/MyList';
import Profile from './pages/Profile';
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
import { useBackButtonInterceptor } from './hooks/useBackButtonInterceptor'; // Adjust path if needed
import NetplixIntro from './components/Intro';
import FooterNav from './components/FooterNav';
import InstallButton from './components/InstallButton';
import Navbar from './components/Navbar';
import MobileHeader from './components/MobileHeader'; // ADDED MOBILE HEADER IMPORT

// --- AIR-GAP: NEW TV APP IMPORT ---
import TVApp from './tv/TVApp';

// Party Watch System
import PartyLobby from './pages/PartyLobby';
import PartyRoom from './pages/PartyRoom';
import PartyToast from "./components/Party/PartyToast";

// Firebase Imports
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, arrayUnion, arrayRemove } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";
import { discordSdk } from "./discord";

/*
const BASE_URL = window.location.hostname === "localhost"
  ? "https://netplix.shop/tmdb-api"
  : "/tmdb-api";
*/

const playNeuralTone = (type = 'start') => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // 'start' = high chirp, 'end' = low pulse
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
  // --- DISCORD ACTIVITY ENGINE ---
  useEffect(() => {
    const setupDiscordActivity = async () => {
      // If we aren't in Discord, stop right here. Let the normal website run.
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

  // GLOBAL VOICE RECOGNITION
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
        playNeuralTone('start'); // Futuristic "Interface Active" ping
      };

      recognitionRef.current.onresult = (event) => {
        if (event.results.length > 0) {
          const result = event.results[0][0].transcript;
          setVoiceTranscript(result);
        }
        playNeuralTone('end'); // Subtle "Data Received" confirmation
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
        // Handle case where recognition was already started but state didn't update
        setIsGlobalListening(false);
      }
    }
  }, [isGlobalListening]);

  // --- MARK 3: BACK BUTTON INTERCEPTORS ---

  // 1. Trap the Back Button if the Movie Player is open
  useBackButtonInterceptor(
    !!activeMedia,
    () => setActiveMedia(null)
  );

  // 2. Trap the Back Button if the "More Info" Modal is open
  useBackButtonInterceptor(
    !!selectedMoreInfo,
    () => setSelectedMoreInfo(null)
  );

  // 3. Trap the Back Button if the Search screen is open
  useBackButtonInterceptor(
    isSearchOpen,
    () => setIsSearchOpen(false)
  );

  // 4. Trap the Back Button if the AI Vibe Search is open
  useBackButtonInterceptor(
    isVibeSearchOpen,
    () => setIsVibeSearchOpen(false)
  );

  // --- AIR-GAP: TV STATE ---
  const [isTVMode, setIsTVMode] = useState(false);

  // Party Watch States
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

  // --- AIR-GAP: TV DETECTION ENGINE ---
  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent.toLowerCase();
      // Detects Smart TVs, Consoles, and massive monitors
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

  // Spatial Navigation Engine (Remote/DPad Support)
  useEffect(() => {
    const handleRemoteInput = (e) => {
      const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      const elements = Array.from(document.querySelectorAll(focusable));
      const currIdx = elements.indexOf(document.activeElement);

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Optional: Implement complex spatial logic here if native focus is insufficient.
        // For now, let standard browser focus take over but ensure we stay in-app.
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
    }, 500); // Small delay to allow page transition animations
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
              region: data.region || 'US'
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

  // FIXED: Popups blocked on mobile
    // SMART LOGIN: Uses Popup for Desktop, Redirect for Mobile
  const handleLogin = async () => {
    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      console.error("Login Error:", error);
    }
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
        // ADD THIS LINE SO THE DATABASE KNOWS IT'S ANIME
        isAnime: currentPage === 'Anime' || media.genre_ids?.includes(16) || false
      };
      const updatedHistory = [movieToStore, ...continueWatching.filter(m => m.id !== media.id)].slice(0, 20);
      await setDoc(userRef, { history: updatedHistory }, { merge: true });
    }
  };

  const toggleWatchlist = async (media) => {
    if (!user) return alert("Please login to manage your list!");
    const userRef = doc(db, "users", user.uid);
    const mediaType = media.media_type || (media.first_air_date ? 'tv' : 'movie');

    // Enhance metadata for categorization
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

  // --- MARK 1: COMPLETED VAULT LOGIC ---
  const toggleCompleted = async (media) => {
    if (!user) return alert("Please login to manage your Watched list!");
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
        removeFromHistory(media.id); // Purge from continue watching!
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

  // Consolidated handleTune function
  const handleTuneChannel = (channel) => {
    setActiveStream({
      name: channel?.name || 'Live Stream',
      url: channel?.url || '',
      image: channel?.image || '',
      code: channel?.country || channel?.code || 'us'
    });

    // Determine destination
    setCurrentPage('LivePlayer');
    window.scrollTo(0, 0);
  };

  const handleStartParty = (media) => {
    setSelectedMoreInfo(null);
    setPartyMedia(media);
    setCurrentPage('Party');
    window.scrollTo(0, 0);
  };

  // --- THE GHOST PROTOCOL ---
  // If activeMedia or activePartyId is true, we hide all navbars so the player takes 100% of the screen.
  const isPlayerActive = activeMedia || (currentPage === 'PartyRoom' && activePartyId);

  // --- AIR-GAP RENDER INTERCEPT ---
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

  // --- EXISTING MOBILE/DESKTOP RENDER ---
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-neon-cyan/30 overflow-x-hidden">

      {showIntro && <NetplixIntro onComplete={() => setShowIntro(false)} />}

      {/* --- NAVIGATION: VANISHES IF PLAYER IS ACTIVE --- */}
      {!isPlayerActive && (
        <>
          {/* MOBILE AERO-HEADER */}
          <div className="md:hidden">
            <MobileHeader
              user={user}
              setCurrentPage={setCurrentPage}
              onSearchClick={() => setIsSearchOpen(true)}
              onVibeSearch={() => setIsVibeSearchOpen(true)}
              onLogin={handleLogin}
            />
          </div>

          {/* DESKTOP NAVBAR */}
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
        </>
      )}

      <PartyToast user={user} onJoin={(id) => {
        setActivePartyId(id);
        setCurrentPage('PartyRoom');
        window.scrollTo(0, 0);
      }} />

      {/* MAIN CONTENT AREA */}
      <main className={`animate-in fade-in duration-700 ${isPlayerActive ? 'fixed inset-0 z-[5000] bg-black p-0 m-0' : 'pt-0 pb-24 md:pb-0'}`}>
        {currentPage === 'Home' && !isPlayerActive && (
          <Home
            continueWatching={continueWatching}
            user={user}
            handlePlay={handlePlay}
            onRemoveFromHistory={removeFromHistory}
            onMoreInfo={setSelectedMoreInfo}
            onJoinParty={(id) => { setActivePartyId(id); setCurrentPage('PartyRoom'); }}
            setCurrentPage={setCurrentPage}
          />
        )}

        {currentPage === 'Party' && !isPlayerActive && (
          <PartyLobby
            user={user}
            onJoinParty={(id) => { setActivePartyId(id); setCurrentPage('PartyRoom'); }}
            preselectedMedia={partyMedia}
            clearPreselectedMedia={() => setPartyMedia(null)}
          />
        )}
        {currentPage === 'PartyRoom' && activePartyId && <PartyRoom partyId={activePartyId} user={user} onLeave={() => { setActivePartyId(null); setCurrentPage('Party'); }} />}
        {/* --- CONSOLIDATED LIVE TV --- */}
        {currentPage === 'LiveTV' && !isPlayerActive && (
          <LiveTV
            onTuneChannel={handleTuneChannel}
            categorizedChannels={liveChannelsMatrix}
            setCategorizedChannels={setLiveChannelsMatrix}
          />
        )}

        {/* --- ELITE PLAYER ROUTE --- */}
        {currentPage === 'LivePlayer' && !isPlayerActive && (
          <CustomLivePlayer
            channelName={activeStream.name}
            streamUrl={activeStream.url}
            onBack={() => setCurrentPage('LiveTV')}
            setStreamUrl={(url) => setActiveStream(prev => ({ ...prev, url }))}
            setChannelName={(name) => setActiveStream(prev => ({ ...prev, name }))}
            categorizedSignals={liveChannelsMatrix}
          />
        )}

        {/* HUB PAGES */}
        {currentPage === 'Movies' && (
          <Movies user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />
        )}
        {currentPage === 'Series' && (
          <Series user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />
        )}
        {currentPage === 'Anime' && (
          <AnimeHub user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />
        )}
        {currentPage === 'Country' && (
          <Country user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />
        )}
        {currentPage === 'MyList' && (
          <MyList user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />
        )}
        {currentPage === 'Profile' && (
          <Profile user={user} onLogin={handleLogin} />
        )}
        {(currentPage === 'Marvel' || currentPage === 'DC' || currentPage === 'Disney' || currentPage === 'StarWars') && <UniversePage type={currentPage.toLowerCase()} user={user} handlePlay={handlePlay} onMoreInfo={setSelectedMoreInfo} />}
        {currentPage === 'Notifications' && <Notifications onMoreInfo={setSelectedMoreInfo} handlePlay={handlePlay} />}

        {/* --- THE PLAYER --- */}
        {activeMedia && !activePartyId && (
          <Player media={activeMedia} toggleCompleted={toggleCompleted} onClose={() => setActiveMedia(null)} />
        )}
      </main>

      {/* --- FOOTER: VANISHES IF PLAYER IS ACTIVE --- */}
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

      {/* MODALS */}
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

      <InstallButton />
    </div>
  );
};

export default App;