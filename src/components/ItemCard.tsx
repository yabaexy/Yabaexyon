import React from 'react';
import { motion } from 'motion/react';
import { Item } from '../types';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';

interface ItemCardProps {
  item: Item;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl overflow-hidden group cursor-pointer"
    >
      <Link to={`/item/${item.onChainId}`}>
        <div className="aspect-square overflow-hidden bg-zinc-100 relative">
          <img
            src={item.imageUrl || `https://picsum.photos/seed/${item.onChainId}/400/400`}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
            <Tag className="w-3 h-3 text-brand" />
            <span className="text-xs font-bold text-zinc-900">{item.price} WYDA</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-zinc-900 truncate">{item.title}</h3>
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2 h-8">{item.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">
              {item.category || 'General'}
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              ID: #{item.onChainId}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
