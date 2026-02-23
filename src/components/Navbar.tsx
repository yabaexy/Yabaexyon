import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, PlusCircle, User, Search, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  account: string | null;
  onConnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ account, onConnect }) => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">WYDA</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-brand' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Marketplace
            </Link>
            <Link 
              to="/sell" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/sell' ? 'text-brand' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Sell Item
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'text-brand' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              My Trades
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {account ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-full border border-zinc-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono text-zinc-600">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
