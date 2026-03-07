import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { motion } from 'motion/react';
import { UserPlus, Camera, Check } from 'lucide-react';

export const SignUp: React.FC = () => {
  const { account } = useWallet();
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

  if (!account) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Wallet Not Connected</h1>
        <p className="text-zinc-500 mb-8">Please go back and connect your wallet to create a profile.</p>
        <button 
          onClick={() => navigate('/signin')}
          className="px-6 py-3 bg-brand text-white font-bold rounded-xl"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-[#F2A93B] rounded-full border-4 border-black flex items-center justify-center shadow-lg mb-4">
              <span className="text-black font-black text-4xl">Y</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase">Yabamate</h1>
            <span className="text-xs font-bold text-zinc-500 tracking-[0.3em] uppercase">Market</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">Create Your Profile</h2>
          <p className="text-zinc-500 text-sm mt-2">
            Join the Yabamate community and start trading.
          </p>
        </div>

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
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Username</label>
            <input
              required
              type="text"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. CryptoKing"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Bio</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={e => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
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
      </motion.div>
    </div>
  );
};
