import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '../constants';
import { Upload, Package, DollarSign, Info } from 'lucide-react';

interface SellItemProps {
  account: string | null;
  provider: ethers.BrowserProvider | null;
}

export const SellItem: React.FC<SellItemProps> = ({ account, provider }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    imageUrl: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !provider) return alert("Please connect your wallet first");

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      const priceWei = ethers.parseEther(formData.price);
      
      // 1. Create listing on chain
      const tx = await contract.createListing(priceWei, "metadata_placeholder");
      const receipt = await tx.wait();
      
      // Find the ListingCreated event to get the onChainId
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === 'ListingCreated';
        } catch {
          return false;
        }
      });
      
      const onChainId = event ? contract.interface.parseLog(event)?.args[0] : 0;

      // 2. Save metadata to our backend
      await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onChainId: Number(onChainId),
          title: formData.title,
          description: formData.description,
          price: formData.price,
          imageUrl: formData.imageUrl || `https://picsum.photos/seed/${onChainId}/800/600`,
          sellerAddress: account,
          category: formData.category
        })
      });

      navigate('/');
    } catch (err: any) {
      console.error(err);
      alert("Error creating listing: " + (err.reason || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="glass-card rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <Package className="text-brand" />
          List Your Item
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Item Title</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Vintage Camera"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Price (WYDA)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all appearance-none bg-white"
              >
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Home</option>
                <option>Collectibles</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the condition, features, and any flaws..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">Image URL (Optional)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
            />
          </div>

          <div className="bg-brand/5 border border-brand/20 rounded-xl p-4 flex gap-3">
            <Info className="text-brand w-5 h-5 shrink-0" />
            <p className="text-xs text-zinc-600 leading-relaxed">
              Listing an item requires a small gas fee on the BSC network. 
              Once listed, it will be visible to all buyers in the marketplace.
            </p>
          </div>

          <button
            disabled={loading || !account}
            type="submit"
            className="w-full py-4 bg-brand hover:bg-brand-dark disabled:bg-zinc-200 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Create Listing
              </>
            )}
          </button>
          
          {!account && (
            <p className="text-center text-xs text-red-500 font-medium">
              Please connect your wallet to list items.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
