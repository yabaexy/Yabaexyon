import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Item, User } from '../types';
import { ItemCard } from '../components/ItemCard';
import { motion } from 'motion/react';
import { MapPin, Calendar, ShoppingBag, Star, Edit2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const SellerProfile: React.FC = () => {
  const { address } = useParams();
  const { account } = useWallet();
  const isOwner = account?.toLowerCase() === address?.toLowerCase();

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['user', address],
    queryFn: () => fetch(`/api/users/${address}`).then(res => res.json()),
  });

  const { data: items, isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ['user-items', address],
    queryFn: () => fetch(`/api/users/${address}/items`).then(res => res.json()),
  });

  if (userLoading) return <div className="max-w-7xl mx-auto p-8 animate-pulse">Loading profile...</div>;
  if (!user) return <div className="max-w-7xl mx-auto p-8">Seller not found</div>;

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
                <span>4.9 Seller Rating</span>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">About</h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">
                {user.bio || "No bio provided."}
              </p>
              
              {isOwner && (
                <Link 
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold transition-all text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Main Content: Items */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Seller's Items</h2>
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
      </div>
    </div>
  );
};
