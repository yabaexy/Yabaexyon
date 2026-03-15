import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Item, User, Transaction } from '../types';
import { ItemCard } from '../components/ItemCard';
import { motion } from 'motion/react';
import { MapPin, Calendar, ShoppingBag, Star, Edit2, History, ArrowRight, CheckCircle } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const SellerProfile: React.FC = () => {
  const { address } = useParams();
  const { account } = useWallet();
  const navigate = useNavigate();
  const isOwner = account?.toLowerCase() === address?.toLowerCase();
  const [activeTab, setActiveTab] = useState<'items' | 'history'>('items');

  useEffect(() => {
    if (isOwner) {
      navigate('/profile', { replace: true });
    }
  }, [isOwner, navigate]);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['user', address],
    queryFn: () => fetch(`/api/users/${address}`).then(res => res.json()),
  });

  const { data: items, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ['user-items', address],
    queryFn: () => fetch(`/api/users/${address}/items`).then(res => res.json()),
  });

  const { data: transactions, isLoading: txLoading } = useQuery<Transaction[]>({
    queryKey: ['user-transactions', address],
    queryFn: () => fetch(`/api/users/${address}/transactions`).then(res => res.json()),
  });

  if (userLoading) return <div className="max-w-7xl mx-auto p-8 animate-pulse">Loading profile...</div>;
  if (!user) return <div className="max-w-7xl mx-auto p-8">Seller not found</div>;

  const averageRating = transactions?.filter(t => t.rating).reduce((acc, t) => acc + (t.rating || 0), 0) || 0;
  const ratingCount = transactions?.filter(t => t.rating).length || 0;
  const displayRating = ratingCount > 0 ? (averageRating / ratingCount).toFixed(1) : "N/A";

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Profile Info */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rounded-3xl p-6 sticky top-24"
          >
            <div className="w-32 h-32 rounded-3xl bg-zinc-100 border border-zinc-200 mx-auto mb-6 overflow-hidden">
              <img 
                src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.address}`} 
                alt={user.username} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h1 className="text-xl font-bold text-center text-zinc-900 mb-1">{user.username}</h1>
            <p className="text-[10px] font-mono text-zinc-400 text-center mb-6 truncate">
              {user.address}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
                <span>{items?.length || 0} Items Listed</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Star className="w-4 h-4 text-brand" />
                <span>{displayRating} Seller Rating ({ratingCount} reviews)</span>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">About</h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                {user.bio || "No bio provided."}
              </p>
              
              {isOwner && (
                <Link 
                  to="/profile"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-all text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex items-center gap-8 border-b border-zinc-200 mb-8">
            <button 
              onClick={() => setActiveTab('items')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'items' ? 'text-brand' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Seller's Items
              {activeTab === 'items' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'history' ? 'text-brand' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              Transaction History
              {activeTab === 'history' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand rounded-full" />}
            </button>
          </div>

          {activeTab === 'items' ? (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-zinc-900">Active Listings</h2>
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>Sort by:</span>
                  <select className="bg-transparent font-bold text-zinc-900 focus:outline-none">
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {itemsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 bg-zinc-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items?.map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                  {items?.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-card rounded-3xl">
                      <p className="text-zinc-400">This seller hasn't listed any items yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-zinc-900 mb-8">Recent Transactions</h2>
              
              {txLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map(tx => (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-brand/30 transition-all"
                    >
                      <div className="w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                        <img 
                          src={tx.itemImageUrl} 
                          alt={tx.itemTitle} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-zinc-900 truncate">{tx.itemTitle}</h3>
                          <span className="text-xs font-black text-brand">{tx.price} WYDA</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <History className="w-3 h-3" />
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-500">
                              <CheckCircle className="w-3 h-3" />
                              {tx.status}
                            </span>
                          </div>
                          {tx.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-3 h-3 ${i < (tx.rating || 0) ? 'text-brand fill-brand' : 'text-zinc-200'}`} 
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        {tx.comment && (
                          <p className="mt-2 text-xs text-zinc-500 italic line-clamp-1">
                            "{tx.comment}"
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center glass-card rounded-3xl">
                  <p className="text-zinc-400">No transaction history found for this seller.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
