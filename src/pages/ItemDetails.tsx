import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { Item, EscrowStatus } from '../types';
import { WYDA_TOKEN_ADDRESS, ESCROW_CONTRACT_ADDRESS, WYDA_ABI, ESCROW_ABI } from '../constants';
import { Shield, ArrowLeft, User, Clock, CheckCircle2, Info, Share2, Heart, MessageSquare, ArrowRight, Gavel } from 'lucide-react';
import { ItemCard } from '../components/ItemCard';

interface ItemDetailsProps {
  account: string | null;
  provider: ethers.BrowserProvider | null;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ account, provider }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);

  const { data: item, isLoading } = useQuery<Item>({
    queryKey: ['item', id],
    queryFn: () => fetch(`/api/items/${id}`).then(res => res.json()),
  });

  const [wydaPrice] = useState(0.15); // Mock price for conversion

  const { data: similarItems } = useQuery<Item[]>({
    queryKey: ['similar-items', item?.category],
    queryFn: () => fetch('/api/items').then(res => res.json()).then((items: Item[]) => 
      items.filter(i => i.category === item?.category && i.onChainId !== item?.onChainId).slice(0, 4)
    ),
    enabled: !!item,
  });

  const handleBuy = async () => {
    if (!account || !provider || !item) return alert("Please connect wallet");

    setBuying(true);
    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(WYDA_TOKEN_ADDRESS, WYDA_ABI, signer);
      const escrowContract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      const priceWei = ethers.parseEther(item.price);

      // 1. Check allowance
      const allowance = await tokenContract.allowance(account, ESCROW_CONTRACT_ADDRESS);
      if (allowance < priceWei) {
        const approveTx = await tokenContract.approve(ESCROW_CONTRACT_ADDRESS, ethers.MaxUint256);
        await approveTx.wait();
      }

      // 2. Buy item
      const buyTx = await escrowContract.buyItem(item.onChainId);
      await buyTx.wait();

      // 3. Record in backend
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.id,
          buyerAddress: account,
          sellerAddress: item.sellerAddress,
          price: item.price
        })
      });

      alert("Purchase successful! Funds are now in escrow.");
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      alert("Error during purchase: " + (err.reason || err.message));
    } finally {
      setBuying(false);
    }
  };

  if (isLoading) return <div className="max-w-7xl mx-auto p-8 animate-pulse">Loading...</div>;
  if (!item) return <div className="max-w-7xl mx-auto p-8">Item not found</div>;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Hero Section with Glassmorphism */}
      <div className="relative h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110"
          style={{ backgroundImage: `url(${item.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-8 left-4 flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-brand text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
                  {item.category}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono bg-white/50 backdrop-blur px-2 py-1 rounded-md border border-white/20">
                  ID: #{item.onChainId}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-zinc-900 tracking-tight leading-none">
                {item.title}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all shadow-sm">
                <Heart className="w-5 h-5 text-zinc-400" />
              </button>
              <button className="p-3 bg-white border border-zinc-200 rounded-2xl hover:bg-zinc-50 transition-all shadow-sm">
                <Share2 className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <div className="glass-card rounded-[2.5rem] overflow-hidden border-zinc-200/50 shadow-2xl shadow-zinc-200/50">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full aspect-[4/3] object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-8">
              <section>
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-4">Description</h3>
                <p className="text-xl text-zinc-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </section>

              <div className="h-px bg-zinc-200" />

              <section className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Link 
                    to={`/seller/${item.sellerAddress}`}
                    className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden group"
                  >
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sellerAddress}`} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                  <div>
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Seller</h4>
                    <Link 
                      to={`/seller/${item.sellerAddress}`}
                      className="text-lg font-bold text-zinc-900 hover:text-brand transition-colors flex items-center gap-2"
                    >
                      {item.sellerAddress.slice(0, 6)}...{item.sellerAddress.slice(-4)}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-2xl font-bold transition-all">
                  <MessageSquare className="w-4 h-4" />
                  Contact
                </button>
              </section>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="glass-card rounded-[2rem] p-8 border-zinc-200/50 shadow-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    {item.pricingType === 'Auction' ? 'Starting Bid' : 'Current Price'}
                  </div>
                  <div className="px-2 py-1 bg-zinc-100 rounded-md text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    {item.pricingType}
                  </div>
                </div>
                <div className="text-5xl font-black text-zinc-900 mb-1 flex items-baseline gap-2">
                  {item.price} <span className="text-xl text-brand">WYDA</span>
                </div>
                <div className="text-sm font-bold text-zinc-400 mb-8">
                  ≈ ${(parseFloat(item.price) * wydaPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleBuy}
                    disabled={buying || account === item.sellerAddress}
                    className="w-full py-5 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-2xl shadow-zinc-900/20 transition-all flex items-center justify-center gap-3 group"
                  >
                    {buying ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {item.pricingType === 'Auction' ? (
                          <Gavel className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        ) : (
                          <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        {account === item.sellerAddress ? "Your Listing" : item.pricingType === 'Auction' ? "Place Bid" : "Buy Now"}
                      </>
                    )}
                  </button>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-4">
                    <Shield className="text-emerald-500 w-6 h-6 shrink-0" />
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Escrow Protected</h4>
                      <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">
                        Funds are held in the smart contract until you confirm delivery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-[2rem] p-6 border-zinc-200/50">
                <div className="flex items-center gap-3 text-zinc-500">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Listed {new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        {similarItems && similarItems.length > 0 && (
          <section className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Similar Treasures</h2>
              <Link to="/" className="text-sm font-bold text-brand hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {similarItems.map(similar => (
                <ItemCard key={similar.id} item={similar} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
