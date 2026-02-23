import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWallet } from './hooks/useWallet';
import { Navbar } from './components/Navbar';
import { Marketplace } from './pages/Marketplace';
import { SellItem } from './pages/SellItem';
import { ItemDetails } from './pages/ItemDetails';
import { Dashboard } from './pages/Dashboard';
import { motion, AnimatePresence } from 'motion/react';

const queryClient = new QueryClient();

export default function App() {
  const { account, provider, connect } = useWallet();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-zinc-50">
          <Navbar account={account} onConnect={connect} />
          
          <main className="pb-20">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Marketplace />
                  </motion.div>
                } />
                <Route path="/sell" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <SellItem account={account} provider={provider} />
                  </motion.div>
                } />
                <Route path="/item/:id" element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ItemDetails account={account} provider={provider} />
                  </motion.div>
                } />
                <Route path="/dashboard" element={
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Dashboard account={account} provider={provider} />
                  </motion.div>
                } />
              </Routes>
            </AnimatePresence>
          </main>

          <footer className="border-t border-zinc-200 py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">W</span>
                </div>
                <span className="font-bold text-zinc-900">WYDA Marketplace</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Built on Binance Smart Chain. Secure, Decentralized, Peer-to-Peer.
              </p>
              <div className="mt-8 text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
                Token: 0xD84B7E8b295d9Fa9656527AC33Bf4F683aE7d2C4
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </QueryClientProvider>
  );
}
