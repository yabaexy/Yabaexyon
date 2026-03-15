import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '../constants';
import { Upload, Package, DollarSign, Info, TrendingUp, Zap, Gavel } from 'lucide-react';

interface SellItemProps {
  account: string | null;
  provider: ethers.BrowserProvider | null;
}

export const SellItem: React.FC<SellItemProps> = ({ account, provider }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [wydaPrice, setWydaPrice] = useState<number>(0.15); // Mock initial price
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    minPrice: '',
    pricingType: 'Fixed' as 'Fixed' | 'Auction',
    category: 'Electronics',
    condition: 'New',
    imageUrl: ''
  });

  // Fetch real-time price (Mocking for WYDA, but structure is real)
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // In a real scenario, you'd fetch from a DEX or price aggregator
        // const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
        // const data = await res.json();
        // setWydaPrice(parseFloat(data.price) * 0.001); // Example conversion
        
        // Mocking a slight fluctuation
        const fluctuation = (Math.random() - 0.5) * 0.01;
        setWydaPrice(prev => Math.max(0.01, prev + fluctuation));
      } catch (err) {
        console.error("Price fetch error:", err);
      }
    };

    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  const usdtEquivalent = (parseFloat(formData.price) || 0) * wydaPrice;
  const minUsdtEquivalent = (parseFloat(formData.minPrice) || 0) * wydaPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !provider) return alert("Please connect your wallet first");

    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);

      const priceWei = ethers.parseEther(formData.price || "0");
      const minPriceWei = ethers.parseEther(formData.minPrice || "0");
      const pricingTypeInt = formData.pricingType === 'Fixed' ? 0 : 1;
      
      // 1. Create listing on chain
      const tx = await contract.createListing(priceWei, minPriceWei, pricingTypeInt, "metadata_placeholder");
      const receipt = await tx.wait();
      
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
          minPrice: formData.minPrice,
          pricingType: formData.pricingType,
          imageUrl: formData.imageUrl || `https://picsum.photos/seed/${onChainId}/800/600`,
          sellerAddress: account,
          category: formData.category,
          condition: formData.condition
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-3xl p-8">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <Package className="text-brand" />
              List Your Item
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pricing Type Toggle */}
              <div className="flex p-1 bg-zinc-100 rounded-2xl mb-8">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pricingType: 'Fixed' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    formData.pricingType === 'Fixed' 
                    ? 'bg-white text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Fixed Price
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, pricingType: 'Auction' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                    formData.pricingType === 'Auction' 
                    ? 'bg-white text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  <Gavel className="w-4 h-4" />
                  Bid Range
                </button>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500">Item Title</label>
                  <span className="text-[10px] font-mono text-zinc-400">{formData.title.length}/60</span>
                </div>
                <input
                  required
                  maxLength={60}
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Vintage 1970s Film Camera"
                  className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">
                    {formData.pricingType === 'Fixed' ? 'Price (WYDA)' : 'Starting Bid (WYDA)'}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all font-mono"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                    ≈ ${usdtEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </p>
                </div>

                {formData.pricingType === 'Auction' && (
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Reserve Price (WYDA)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.minPrice}
                        onChange={e => setFormData({ ...formData, minPrice: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all font-mono"
                      />
                    </div>
                    <p className="mt-2 text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                      ≈ ${minUsdtEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </p>
                  </div>
                )}

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all appearance-none bg-white font-medium"
                    >
                      <option>Electronics</option>
                      <option>Fashion</option>
                      <option>Home</option>
                      <option>Collectibles</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Condition</label>
                    <select
                      value={formData.condition}
                      onChange={e => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all appearance-none bg-white font-medium"
                    >
                      <option>New</option>
                      <option>Like New</option>
                      <option>Used - Excellent</option>
                      <option>Used - Good</option>
                      <option>Used - Fair</option>
                    </select>
                  </div>
                </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-zinc-500">Specific Description</label>
                  <span className="text-[10px] font-mono text-zinc-400">{formData.description.length}/500</span>
                </div>
                <textarea
                  required
                  maxLength={500}
                  rows={5}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide specific details about condition, history, and technical specs..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Image URL</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      required
                      type="url"
                      value={formData.imageUrl}
                      onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all font-mono text-xs"
                    />
                  </div>
                  {formData.imageUrl && (
                    <div className="w-12 h-12 rounded-lg border-2 border-zinc-100 overflow-hidden flex-shrink-0">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Error')}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[10px] text-zinc-400 italic">
                  Tip: High-quality images increase trust and sales speed.
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
                    {formData.pricingType === 'Fixed' ? 'Create Listing' : 'Start Auction'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Market Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-3xl p-6 border-brand/20 bg-brand/5">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <TrendingUp className="text-brand w-4 h-4" />
              Market Price
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase font-black text-zinc-400 tracking-widest mb-1">WYDA / USD</div>
                <div className="text-2xl font-black text-zinc-900">
                  ${wydaPrice.toFixed(4)}
                </div>
              </div>
              <div className="h-px bg-brand/10" />
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-zinc-400 uppercase">24h Change</span>
                <span className="text-emerald-500">+4.2%</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Info className="text-zinc-400 w-4 h-4" />
              Pricing Guide
            </h3>
            <div className="space-y-4 text-xs text-zinc-500 leading-relaxed">
              <p>
                <strong className="text-zinc-900">Fixed Price:</strong> Your item is sold immediately when a buyer pays the full amount.
              </p>
              <p>
                <strong className="text-zinc-900">Bid Range:</strong> Set a starting bid and an optional reserve price. Buyers can place bids within your specified range.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
