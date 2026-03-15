import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '../constants';
import { Item, EscrowStatus, Transaction } from '../types';
import { Package, ArrowRight, CheckCircle, RotateCcw, Settings, Edit2, X, Save, ShoppingBag, PlusCircle, ExternalLink, Calendar, Star, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ItemCard } from '../components/ItemCard';
import { motion } from 'motion/react';
import { WYDA_TOKEN_ADDRESS, WYDA_ABI } from '../constants';

interface ProfileProps {
  account: string | null;
  provider: ethers.BrowserProvider | null;
}

export const Profile: React.FC<ProfileProps> = ({ account, provider }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatarUrl: '' });
  const [filters, setFilters] = useState({
    category: 'All',
    condition: 'All',
    minPrice: '',
    maxPrice: ''
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', account],
    queryFn: () => fetch(`/api/users/${account}`).then(res => res.ok ? res.json() : null),
    enabled: !!account,
  });

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance', account],
    queryFn: async () => {
      if (!provider || !account) return '0';
      try {
        const contract = new ethers.Contract(WYDA_TOKEN_ADDRESS, WYDA_ABI, provider);
        const bal = await contract.balanceOf(account);
        return ethers.formatEther(bal);
      } catch (err) {
        console.error("Balance fetch error:", err);
        return '0';
      }
    },
    enabled: !!account && !!provider,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const { data: myItems, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ['my-items', account],
    queryFn: () => fetch(`/api/users/${account}/items`).then(res => res.json()),
    enabled: !!account,
  });

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['my-transactions', account],
    queryFn: () => fetch(`/api/users/${account}/transactions`).then(res => res.json()),
    enabled: !!account,
  });

  const handleRate = async (txId: number, rating: number, comment: string) => {
    try {
      const res = await fetch(`/api/transactions/${txId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, buyerAddress: account })
      });
      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['my-transactions', account] });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = myItems?.filter(item => {
    const matchesCategory = filters.category === 'All' || item.category === filters.category;
    const matchesCondition = filters.condition === 'All' || item.condition === filters.condition;
    const matchesMinPrice = filters.minPrice === '' || parseFloat(item.price) >= parseFloat(filters.minPrice);
    const matchesMaxPrice = filters.maxPrice === '' || parseFloat(item.price) <= parseFloat(filters.maxPrice);
    return matchesCategory && matchesCondition && matchesMinPrice && matchesMaxPrice;
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
          <h1 className="text-3xl font-bold text-zinc-900">Profile</h1>
          <p className="text-zinc-500">Manage your profile and active trades.</p>
        </div>
      </header>

      {!account ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-zinc-500 mb-4">Please connect your wallet to view your profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar: Profile Management */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-3xl p-6 sticky top-24"
            >
              <div className="w-32 h-32 rounded-3xl bg-zinc-100 border border-zinc-200 mx-auto mb-6 overflow-hidden relative group">
                <img 
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${account}`} 
                  alt={user?.username} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {!isEditing && (
                  <button 
                    onClick={handleEdit}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Edit2 className="w-6 h-6" />
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    placeholder="Username"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                  />
                  <input
                    type="text"
                    value={editForm.avatarUrl}
                    onChange={e => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    placeholder="Avatar URL"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:ring-2 focus:ring-brand/20 outline-none"
                  />
                  <textarea
                    rows={3}
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    placeholder="Bio"
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:ring-2 focus:ring-brand/20 outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex-1 py-2 bg-brand text-white rounded-lg text-xs font-bold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-center text-zinc-900 mb-1">{user?.username || 'Unnamed Seller'}</h1>
                  <p className="text-[10px] font-mono text-zinc-400 text-center mb-6 truncate">
                    {account}
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <ShoppingBag className="w-4 h-4 text-zinc-400" />
                      <span>{myItems?.length || 0} Items Listed</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Star className="w-4 h-4 text-brand" />
                      <span>4.9 Seller Rating</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-600">
                      <Coins className="w-4 h-4 text-brand" />
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">
                          {balanceLoading ? '...' : parseFloat(balance || '0').toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} WYDA
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Available Balance</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">About</h3>
                      <button onClick={handleEdit} className="text-brand hover:text-brand-dark transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-sm text-zinc-600 leading-relaxed">
                      {user?.bio || "No bio provided."}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Main Content: Listings & Trades */}
          <div className="lg:col-span-3 space-y-12">
            {/* My Listings Section */}
            <section>
              <div className="flex flex-col gap-6 mb-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="text-brand" />
                    My Listings
                  </h2>
                  <Link 
                    to="/sell" 
                    className="text-sm font-bold text-brand hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-4 h-4" />
                    List New Item
                  </Link>
                </div>

                {/* Filters UI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Category</label>
                    <select 
                      value={filters.category}
                      onChange={e => setFilters({ ...filters, category: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-2 focus:ring-brand/20 outline-none"
                    >
                      <option>All</option>
                      <option>Electronics</option>
                      <option>Fashion</option>
                      <option>Home</option>
                      <option>Collectibles</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Condition</label>
                    <select 
                      value={filters.condition}
                      onChange={e => setFilters({ ...filters, condition: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-2 focus:ring-brand/20 outline-none"
                    >
                      <option>All</option>
                      <option>New</option>
                      <option>Like New</option>
                      <option>Used - Excellent</option>
                      <option>Used - Good</option>
                      <option>Used - Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Min Price (WYDA)</label>
                    <input 
                      type="number"
                      value={filters.minPrice}
                      onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-2 focus:ring-brand/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Max Price (WYDA)</label>
                    <input 
                      type="number"
                      value={filters.maxPrice}
                      onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                      placeholder="Any"
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs focus:ring-2 focus:ring-brand/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              {itemsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-64 bg-zinc-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredItems && filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map(item => (
                    <ItemCard 
                      key={item.id} 
                      item={item} 
                      onDelete={() => queryClient.invalidateQueries({ queryKey: ['my-items', account] })}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-12 text-center">
                  <p className="text-zinc-500 mb-4">
                    {myItems && myItems.length > 0 
                      ? "No items match your current filters." 
                      : "You haven't listed any items for sale yet."}
                  </p>
                  {myItems && myItems.length > 0 ? (
                    <button 
                      onClick={() => setFilters({ category: 'All', condition: 'All', minPrice: '', maxPrice: '' })}
                      className="text-brand font-bold hover:underline"
                    >
                      Clear all filters
                    </button>
                  ) : (
                    <Link 
                      to="/sell" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-all"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Start Selling
                    </Link>
                  )}
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Package className="text-brand" />
                  Purchases
                </h2>
                <div className="space-y-4">
                  {txLoading ? (
                    <div className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
                  ) : transactions?.filter(t => t.buyerAddress.toLowerCase() === account?.toLowerCase()).length ? (
                    transactions.filter(t => t.buyerAddress.toLowerCase() === account?.toLowerCase()).map(tx => (
                      <div key={tx.id} className="glass-card rounded-2xl p-6 border-l-4 border-l-brand">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-zinc-900">{tx.itemTitle}</h3>
                            <p className="text-xs text-zinc-500 mt-1">Seller: {tx.sellerAddress.slice(0, 6)}...{tx.sellerAddress.slice(-4)}</p>
                          </div>
                          <span className="px-2 py-1 bg-brand/10 text-brand text-[10px] font-bold rounded uppercase">
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold">{tx.price} WYDA</div>
                          {!tx.rating ? (
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <button 
                                  key={star}
                                  onClick={() => handleRate(tx.id, star, "Great trade!")}
                                  className="text-zinc-200 hover:text-brand transition-colors"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < tx.rating! ? 'text-brand fill-brand' : 'text-zinc-200'}`} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-zinc-400 py-8">No active purchases.</p>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <RotateCcw className="text-brand" />
                  Sales
                </h2>
                <div className="space-y-4">
                  {txLoading ? (
                    <div className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
                  ) : transactions?.filter(t => t.sellerAddress.toLowerCase() === account?.toLowerCase()).length ? (
                    transactions.filter(t => t.sellerAddress.toLowerCase() === account?.toLowerCase()).map(tx => (
                      <div key={tx.id} className="glass-card rounded-2xl p-6 border-l-4 border-l-emerald-500">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-zinc-900">{tx.itemTitle}</h3>
                            <p className="text-xs text-zinc-500 mt-1">Buyer: {tx.buyerAddress.slice(0, 6)}...{tx.buyerAddress.slice(-4)}</p>
                          </div>
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded uppercase">
                            {tx.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold">{tx.price} WYDA</div>
                          {tx.rating ? (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < tx.rating! ? 'text-brand fill-brand' : 'text-zinc-200'}`} />
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">No rating yet</span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-xs text-zinc-400 py-8">No active sales.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
