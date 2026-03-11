import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWallet } from './hooks/useWallet';
import { Navbar } from './components/Navbar';
import { Marketplace } from './pages/Marketplace';
import { SellItem } from './pages/SellItem';
import { EditItem } from './pages/EditItem';
import { ItemDetails } from './pages/ItemDetails';
import { Dashboard } from './pages/Dashboard';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { SellerProfile } from './pages/SellerProfile';
import { CategoryPage } from './pages/CategoryPage';
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
                <Route path="/edit/:id" element={
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <EditItem />
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
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/seller/:address" element={<SellerProfile />} />
                <Route path="/category/:category" element={<CategoryPage />} />
              </Routes>
            </AnimatePresence>
          </main>

          <footer className="border-t border-zinc-200 py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="flex flex-col items-center justify-center gap-4 mb-8">
                <div className="w-16 h-16 bg-[#F2A93B] rounded-full border-4 border-black flex items-center justify-center shadow-md">
                  <span className="text-black font-black text-3xl">Y</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">Yabamate</span>
                  <span className="text-xs font-bold text-zinc-500 tracking-[0.3em] uppercase">Market</span>
                </div>
              </div>
              <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                The premier decentralized marketplace on Binance Smart Chain. 
                Secure, transparent, and community-driven commerce.
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
