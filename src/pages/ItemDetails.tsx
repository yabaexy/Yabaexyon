import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { Item, EscrowStatus } from '../types';
import { WYDA_TOKEN_ADDRESS, ESCROW_CONTRACT_ADDRESS, WYDA_ABI, ESCROW_ABI } from '../constants';
import { Shield, ArrowLeft, User, Clock, CheckCircle2 } from 'lucide-react';

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

      alert("Purchase successful! Funds are now in escrow.");
      navigate('/dashboard');
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="aspect-square rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-brand/10 text-brand text-xs font-bold rounded-full uppercase tracking-wider">
                {item.category}
              </span>
              <span className="text-xs text-zinc-400 font-mono">ID: #{item.onChainId}</span>
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-4">{item.title}</h1>
            <div className="flex items-center gap-4 text-zinc-500 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-mono">{item.sellerAddress.slice(0, 6)}...{item.sellerAddress.slice(-4)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Listed {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="text-sm text-zinc-500 mb-1">Price</div>
            <div className="text-3xl font-bold text-zinc-900 flex items-baseline gap-2">
              {item.price} <span className="text-lg text-brand">WYDA</span>
            </div>
          </div>

          <div className="prose prose-zinc mb-8">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          <div className="mt-auto space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-4">
              <Shield className="text-emerald-500 w-6 h-6 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-emerald-900">Buyer Protection Enabled</h4>
                <p className="text-xs text-emerald-700 mt-1">
                  Your funds are held securely in the smart contract until you confirm you've received the item.
                </p>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={buying || account === item.sellerAddress}
              className="w-full py-4 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {buying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {account === item.sellerAddress ? "You are the seller" : "Buy with Escrow"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
