import React, { useState } from 'react';
import { X, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Ensure this matches your firebase.js location

const AuthModal = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added for security
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate matching passwords on Sign Up
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // 1. CREATE AUTH USER
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. CREATE DATABASE PROFILE
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          createdAt: Date.now(),
          watchlist: [],
          history: [],
          completed: [],
          preferences: [],
          region: 'US' // default region
        }, { merge: true });

        onClose();
      } else {
        // LOG IN
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (err) {
      console.error("Auth Error:", err.code);
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered.');
      else if (err.code === 'auth/invalid-credential') setError('Invalid email or password.');
      else if (err.code === 'auth/weak-password') setError('Password is too weak (min 6 chars).');
      else setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-md p-8 relative shadow-2xl">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-2">
          {isSignUp ? 'Neural Link Init' : 'System Access'}
        </h2>
        <p className="text-slate-500 text-xs uppercase tracking-widest mb-6">
          {isSignUp ? 'Create your unique identity' : 'Enter credentials to synchronize'}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-3 rounded-lg mb-4 uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="USERNAME" 
                required 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:border-neon-cyan outline-none transition-all font-bold"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:border-neon-cyan outline-none transition-all font-bold"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="password" 
              placeholder="PASSWORD" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:border-neon-cyan outline-none transition-all font-bold"
            />
          </div>

          {isSignUp && (
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                placeholder="CONFIRM PASSWORD" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 text-sm focus:border-neon-cyan outline-none transition-all font-bold"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-neon-cyan hover:bg-white text-black font-black py-4 rounded-lg transition-all duration-300 mt-2 disabled:opacity-50 uppercase text-xs tracking-widest shadow-neon"
          >
            {loading ? 'Transmitting...' : (isSignUp ? 'Create Identity' : 'Establish Connection')}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-[10px] tracking-widest uppercase">
          {isSignUp ? "Already recognized? " : "New node in the network? "}
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }} 
            className="text-white hover:text-neon-cyan font-black transition-colors"
          >
            {isSignUp ? "Sign In" : "Sign up now"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
