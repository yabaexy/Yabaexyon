import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import { Package, DollarSign, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const EditItem: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [wydaPrice, setWydaPrice] = useState<number>(0.15);
  const [formData, setFormData] = useState({
    id: 0,
    title: '',
    description: '',
    price: '',
    minPrice: '',
    pricingType: 'Fixed' as 'Fixed' | 'Auction',
    category: 'Electronics',
    condition: 'New',
    imageUrl: '',
    sellerAddress: ''
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
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

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            minPrice: data.minPrice || '',
            pricingType: data.pricingType,
            category: data.category || 'Electronics',
            condition: data.condition || 'New',
            imageUrl: data.imageUrl,
            sellerAddress: data.sellerAddress
          });
        } else {
          alert("Item not found");
          navigate('/profile');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchItem();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return alert("Please connect your wallet first");
    if (account.toLowerCase() !== formData.sellerAddress.toLowerCase()) {
      return alert("Unauthorized: You do not own this listing");
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/items/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sellerAddress: account
        })
      });

      if (res.ok) {
        navigate(`/item/${id}`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update listing");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error updating listing: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500">Loading item details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="glass-card rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
          <Package className="text-brand" />
          Edit Listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-zinc-500 mb-2">Price (WYDA)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-zinc-100 focus:border-brand outline-none transition-all font-mono"
                />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">
                  Note: Updates display only. On-chain price is static.
                </p>
                <p className="text-[10px] text-brand font-black uppercase tracking-widest">
                  ≈ ${usdtEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                </p>
              </div>
            </div>

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
          </div>

          <div className="flex gap-4">
            <button
              disabled={loading || !account}
              type="submit"
              className="flex-1 py-4 bg-brand hover:bg-brand-dark disabled:bg-zinc-200 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
