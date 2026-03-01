import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Item } from '../types';
import { ItemCard } from '../components/ItemCard';
import { motion } from 'motion/react';
import { ChevronRight, Filter } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { category } = useParams();

  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ['category-items', category],
    queryFn: () => fetch('/api/items').then(res => res.json()).then((items: Item[]) => 
      items.filter(i => i.category.toLowerCase() === category?.toLowerCase())
    ),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-8">
        <Link to="/" className="hover:text-zinc-900 transition-colors">Marketplace</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-900">{category}</span>
      </div>

      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-zinc-900 tracking-tight mb-4 capitalize">
            {category}
          </h1>
          <p className="text-zinc-500 max-w-xl">
            Browse the best deals in {category}. All transactions are secured by WYDA escrow smart contracts.
          </p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-700 hover:bg-zinc-50 transition-all shadow-sm">
          <Filter className="w-4 h-4" />
          Filter & Sort
        </button>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-zinc-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items?.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
          {items?.length === 0 && (
            <div className="col-span-full py-32 text-center glass-card rounded-[3rem]">
              <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Filter className="text-zinc-300 w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">No items found</h3>
              <p className="text-zinc-400">We couldn't find any items in this category right now.</p>
              <Link to="/sell" className="inline-block mt-8 px-8 py-4 bg-brand text-white font-bold rounded-2xl shadow-lg shadow-brand/20">
                Be the first to list
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
