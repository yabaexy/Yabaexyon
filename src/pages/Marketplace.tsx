import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ItemCard } from '../components/ItemCard';
import { Item } from '../types';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Marketplace: React.FC = () => {
  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: () => fetch('/api/items').then(res => res.json()),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-4">
          Discover Secondhand Treasures
        </h1>
        <p className="text-zinc-500 max-w-2xl">
          Secure trading on Yabamate Market powered by BSC smart contracts. 
          Your funds are held in escrow until you confirm receipt.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items, categories, or sellers..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-xl font-medium text-zinc-700 hover:bg-zinc-50 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        {['Electronics', 'Fashion', 'Home', 'Collectibles', 'Other'].map(cat => (
          <Link
            key={cat}
            to={`/category/${cat}`}
            className="px-6 py-2 bg-white border border-zinc-200 rounded-full text-sm font-bold text-zinc-600 hover:border-brand hover:text-brand transition-all shadow-sm"
          >
            {cat}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-zinc-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items?.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
          {items?.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-zinc-400">No items found. Be the first to sell something!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
