import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Profile({ user, setUser }) {
  const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_KEY;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState([]);
  const [showAvatarSelect, setShowAvatarSelect] = useState(false);

  const genres = ["Action", "Comedy", "Horror", "Romance", "Sci-Fi", "Drama"];

  // =========================
  // 🔄 Load Preferences
  // =========================
  useEffect(() => {
    if (!user) return;

    const fetchPrefs = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setPreferences(snap.data().preferences || []);
      }
    };

    fetchPrefs();
  }, [user]);

  // =========================
  // 🔐 LOGIN
  // =========================
  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🆕 SIGNUP
  // =========================
  const handleSignup = async () => {
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(res.user, { displayName: username });

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        preferences: [],
        photoURL: "",
      });

      setUser(res.user);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // 🎭 Avatar Upload
  // =========================
  const handleUpdateAvatar = async (file) => {
    if (!file || !IMGBB_API_KEY) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      const url = data.data.url;

      await updateProfile(auth.currentUser, { photoURL: url });

      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: url },
        { merge: true }
      );

      // Instant UI update
      setUser({ ...auth.currentUser });
      setShowAvatarSelect(false);
    } catch (err) {
      alert("Avatar upload failed");
    }
  };

  // =========================
  // 🎬 Toggle Genres
  // =========================
  const toggleGenre = async (genre) => {
    let newPrefs;

    if (preferences.includes(genre)) {
      newPrefs = preferences.filter((g) => g !== genre);
    } else {
      newPrefs = [...preferences, genre];
    }

    setPreferences(newPrefs);

    await setDoc(
      doc(db, "users", user.uid),
      { preferences: newPrefs },
      { merge: true }
    );
  };

  // =========================
  // 🚪 LOGOUT
  // =========================
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ===================================================
  // 🔥 MANUAL LOGIN UI (INSIDE PROFILE PAGE)
  // ===================================================
  if (!user) {
    return (
      <div className="w-full pt-40 pb-24 px-6">
        <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Account Login
          </h2>

          <input
            type="text"
            placeholder="Username (for signup)"
            className="w-full mb-4 p-3 rounded bg-slate-800 text-white"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-3 rounded bg-slate-800 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 p-3 rounded bg-slate-800 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex gap-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 p-3 rounded text-white"
            >
              Login
            </button>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 p-3 rounded text-white"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // 👤 PROFILE PAGE
  // ===================================================
  return (
    <div className="w-full pt-40 pb-24 px-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <img
            src={user.photoURL || "https://via.placeholder.com/100"}
            alt="avatar"
            className="w-24 h-24 rounded-full object-cover cursor-pointer"
            onClick={() => setShowAvatarSelect(true)}
          />

          <div>
            <h2 className="text-3xl font-bold">
              {user.displayName || "User"}
            </h2>
            <p className="text-slate-400">{user.email}</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4">
          Your Favorite Genres
        </h3>

        <div className="flex flex-wrap gap-4">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`px-4 py-2 rounded-full border ${
                preferences.includes(genre)
                  ? "bg-blue-600 border-blue-600"
                  : "border-slate-600"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-12 bg-red-600 hover:bg-red-700 px-6 py-3 rounded"
        >
          Logout
        </button>
      </div>

      {/* Avatar Modal */}
      {showAvatarSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpdateAvatar(e.target.files[0])}
            />
            <button
              onClick={() => setShowAvatarSelect(false)}
              className="block mt-4 text-red-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


