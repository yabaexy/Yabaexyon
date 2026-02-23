import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ethers } from 'ethers';
import { ESCROW_CONTRACT_ADDRESS, ESCROW_ABI } from '../constants';
import { Item, EscrowStatus } from '../types';
import { Package, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react';

interface DashboardProps {
  account: string | null;
  provider: ethers.BrowserProvider | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ account, provider }) => {
  // In a real app, we'd fetch events from the contract or indexed data.
  // For this demo, we'll just show the UI structure.
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-zinc-900">My Trades</h1>
        <p className="text-zinc-500">Manage your active purchases and sales.</p>
      </header>

      {!account ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <p className="text-zinc-500 mb-4">Please connect your wallet to view your trades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Package className="text-brand" />
              Purchases
            </h2>
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-6 border-l-4 border-l-brand">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-zinc-900">Vintage Film Camera</h3>
                    <p className="text-xs text-zinc-500 mt-1">Seller: 0x1234...5678</p>
                  </div>
                  <span className="px-2 py-1 bg-brand/10 text-brand text-[10px] font-bold rounded uppercase">
                    Locked in Escrow
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">450 WYDA</div>
                  <button className="px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-lg hover:bg-black transition-all">
                    Confirm Receipt
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-400 py-8">No other active purchases.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <RotateCcw className="text-brand" />
              Sales
            </h2>
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-6 border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-zinc-900">Mechanical Keyboard</h3>
                    <p className="text-xs text-zinc-500 mt-1">Buyer: 0xabcd...efgh</p>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded uppercase">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">120 WYDA</div>
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Funds Released
                  </span>
                </div>
              </div>
              <p className="text-center text-xs text-zinc-400 py-8">No other active sales.</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
