import React from 'react';
import { motion } from 'motion/react';
import { Item } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Tag, Edit2, Trash2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

interface ItemCardProps {
  item: Item;
  onDelete?: (id: number) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete }) => {
  const { account } = useWallet();
  const navigate = useNavigate();
  const isOwner = account?.toLowerCase() === item.sellerAddress.toLowerCase();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this listing?")) return;

    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerAddress: account })
      });

      if (res.ok) {
        onDelete?.(item.id);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete item");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit/${item.onChainId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl overflow-hidden group cursor-pointer relative"
    >
      {isOwner && (
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <button
            onClick={handleEdit}
            className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-brand hover:text-white transition-all text-zinc-600"
            title="Edit Listing"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-red-500 hover:text-white transition-all text-zinc-600"
            title="Delete Listing"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <Link to={`/item/${item.onChainId}`}>
        <div className="aspect-square overflow-hidden bg-zinc-100 relative">
          <img
            src={item.imageUrl || `https://picsum.photos/seed/${item.onChainId}/400/400`}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className={`absolute top-3 ${isOwner ? 'left-24' : 'left-3'} bg-zinc-900/80 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm`}>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              {item.pricingType === 'Auction' ? 'Auction' : 'Fixed'}
            </span>
          </div>
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
