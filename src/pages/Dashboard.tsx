import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '../constants';
import { Item, EscrowStatus } from '../types';
import { Package, ArrowRight, CheckCircle, RotateCcw, Settings, Edit2, X, Save } from 'lucide-react';

interface DashboardProps {
  account: string | null;
  provider: ethers.BrowserProvider | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ account, provider }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatarUrl: '' });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', account],
    queryFn: () => fetch(`/api/users/${account}`).then(res => res.ok ? res.json() : null),
    enabled: !!account,
  });

  const handleEdit = () => {
    if (user) {
      setEditForm({
        username: user.username || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: account,
          ...editForm
        })
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['user', account] });
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">My Dashboard</h1>
          <p className="text-zinc-500">Manage your profile and active trades.</p>
        </div>
        {account && user && !isEditing && (
          <button 
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-all"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </header>

      {!account ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-zinc-500 mb-4">Please connect your wallet to view your dashboard.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Profile Table Section */}
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Settings className="text-brand" />
              Profile Information
            </h2>
            
            {isEditing ? (
              <div className="glass-card rounded-3xl p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Avatar URL</label>
                    <input
                      type="text"
                      value={editForm.avatarUrl}
                      onChange={e => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">Bio</label>
                    <textarea
                      rows={3}
                      value={editForm.bio}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 outline-none resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-4 justify-end">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-zinc-100 text-zinc-600 rounded-xl font-bold hover:bg-zinc-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100">
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Field</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-500">Wallet Address</td>
                      <td className="px-6 py-4 text-sm font-mono text-zinc-900">{account}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-500">Username</td>
                      <td className="px-6 py-4 text-sm text-zinc-900">{user?.username || 'Not set'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-500">Bio</td>
                      <td className="px-6 py-4 text-sm text-zinc-900">{user?.bio || 'No bio provided'}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm font-medium text-zinc-500">Member Since</td>
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Package className="text-brand" />
              Purchases
            </h2>
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-6 border-l-4 border-l-brand">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-zinc-900">Vintage Film Camera</h3>
                    <p className="text-xs text-zinc-500 mt-1">Seller: 0x1234...5678</p>
                  </div>
                  <span className="px-2 py-1 bg-brand/10 text-brand text-[10px] font-bold rounded uppercase">
                    Locked in Escrow
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">450 WYDA</div>
                  <button className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-all">
                    Confirm Receipt
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-400 py-8">No other active purchases.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <RotateCcw className="text-brand" />
              Sales
            </h2>
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-6 border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-zinc-900">Mechanical Keyboard</h3>
                    <p className="text-xs text-zinc-500 mt-1">Buyer: 0xabcd...efgh</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded uppercase">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">120 WYDA</div>
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Funds Released
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-400 py-8">No other active sales.</p>
            </div>
          </section>
        </div>
      </div>
      )}
    </div>
  );
};
