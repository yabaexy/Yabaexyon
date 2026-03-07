import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ethers } from 'ethers';
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

  const checkUser = async () => {
    setChecking(true);
    try {
      // 1. Get Nonce
      const nonceRes = await fetch(`/api/auth/nonce/${account}`);
      const { nonce } = await nonceRes.json();

      // 2. Sign Message
      if (!window.ethereum) throw new Error("No crypto wallet found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);

      // 3. Verify Signature
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account, signature })
      });

      if (!verifyRes.ok) throw new Error("Authentication failed");

      // 4. Check if user exists
      const userRes = await fetch(`/api/users/${account}`);
      if (userRes.ok) {
        navigate('/dashboard');
      } else {
        navigate('/signup');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred during authentication");
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
          <button
            onClick={connect}
            className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2"
          >
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </button>
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
      </motion.div>
    </div>
  );
};
