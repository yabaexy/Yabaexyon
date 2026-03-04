import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { motion } from 'motion/react';
import { UserPlus, Wallet, Camera, Check } from 'lucide-react';

export const SignUp: React.FC = () => {
  const { account, connect } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatarUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Please connect your wallet first");

    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: account,
          ...formData
        })
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create profile");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-brand w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Create Profile</h1>
          <p className="text-zinc-500 text-sm mt-2">
            Set up your identity on the Yabamate Market.
          </p>
        </div>

        {!account ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-500 mb-6">
              You need to connect your wallet to create a profile.
            </p>
            <button
              onClick={connect}
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-zinc-100 border-2 border-zinc-200 overflow-hidden flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <Camera className="text-zinc-400 w-8 h-8" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold uppercase">Change</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Username</label>
              <input
                required
                type="text"
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                placeholder="How should we call you?"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Bio</label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Avatar URL (Optional)</label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-mono text-zinc-400 truncate">
                Wallet: {account}
              </span>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Complete Profile
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
