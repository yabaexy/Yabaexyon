import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { motion } from 'motion/react';
import { LogIn, Wallet, ArrowRight } from 'lucide-react';

export const SignIn: React.FC = () => {
  const { account, connect, error } = useWallet();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (account) {
      checkUser();
    }
  }, [account]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log("Google User:", event.data.user);
        // In a real app, you'd handle the user session here
        // For now, we'll just show a success message or redirect
        alert(`Signed in as ${event.data.user.name}`);
        navigate('/dashboard');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const res = await fetch('/api/auth/google/url');
      const { url } = await res.json();
      window.open(url, 'google_oauth', 'width=500,height=600');
    } catch (err) {
      console.error("Google Auth URL error:", err);
    }
  };

  const checkUser = async () => {
    setChecking(true);
    try {
      const res = await fetch(`/api/users/${account}`);
      if (res.ok) {
        navigate('/dashboard');
      } else {
        navigate('/signup');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8 text-center"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-[#F2A93B] rounded-full border-4 border-black flex items-center justify-center shadow-lg mb-4">
            <span className="text-black font-black text-4xl">Y</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase">Yabamate</h1>
          <span className="text-xs font-bold text-zinc-500 tracking-[0.3em] uppercase">Market</span>
        </div>
        <p className="text-zinc-500 mb-8 text-sm">
          Connect your wallet to access your account and manage your trades.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        {!account ? (
          <div className="space-y-4">
            <button
              onClick={connect}
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-zinc-100 flex-1" />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Or continue with</span>
              <div className="h-px bg-zinc-100 flex-1" />
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full py-4 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold rounded-xl transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
              Sign in with Google
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 rounded-full border border-zinc-200">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-xs font-mono text-zinc-600">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {checking ? "Checking profile..." : "Wallet connected"}
            </p>
          </div>
        )}

        <div className="mt-8 pt-8 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            New to Yabamate?{' '}
            <Link to="/signup" className="text-brand font-bold hover:underline">
              Create a profile
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
