import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Book, LayoutDashboard, Calculator, User as UserIcon, LogOut, ChevronRight, Calculator as CalcIcon, FileText, Target, Box, Star, CheckCircle, Ghost, BookHeart, Zap, Puzzle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const location = useLocation();
  const { isGuest, currentUser, logout, userData } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const isDocsPage = location.pathname === '/docs' || location.pathname === '/';

  const docsItems = [
    { href: '#overview', label: 'Cerita Kita', icon: BookHeart },
    { href: '#latar-belakang', label: 'Mengapa Kita Ada', icon: Target },
    { href: '#konsep', label: 'Cara Mainnya', icon: Box },
    { href: '#fitur', label: 'Superpowers', icon: Zap },
    { href: '#komponen', label: 'Isi Starter Kit', icon: Puzzle },
  ];

  const navItems = [
    { path: '/users/dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { path: '/calculator', label: 'Kalkulator', icon: CalcIcon }
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               className="bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full text-center"
            >
              <h3 className="text-xl font-black mb-2">Yakin mau keluar?</h3>
              <p className="text-black/60 font-medium mb-6">Kamu harus login lagi nanti untuk masuk.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 border-2 border-black rounded-xl font-bold transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  Batal
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-2 bg-red-400 hover:bg-red-500 text-white border-2 border-black rounded-xl font-bold transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                >
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        className={`fixed top-0 left-0 bottom-0 w-72 bg-white border-r-4 border-black z-50 transform transition-transform duration-300 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 border-b-4 border-black bg-pink-100 flex justify-between items-center">
          <div className="font-black text-2xl tracking-tighter">Dear Me</div>
          <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {isDocsPage ? (
            <div className="space-y-3">
              <div className="text-sm font-black uppercase text-black/50 mb-4 px-2">Table of Contents</div>
              {docsItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-2xl border-2 border-transparent hover:bg-pink-50 hover:border-black font-medium transition-all"
                >
                  <item.icon className="w-5 h-5 text-pink-500" />
                  <span className="text-sm">{item.label}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
               <div className="text-sm font-black uppercase text-black/50 mb-4 px-2">Menu Utama</div>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const hideForGuest = (!currentUser || isGuest) && item.path === '/users/dashboard';
                if (hideForGuest) return null;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                      isActive 
                        ? 'bg-purple-200 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold font-sans' 
                        : 'border-transparent hover:bg-gray-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t-4 border-black bg-gray-50 flex flex-col gap-2">
           {!currentUser ? (
             <Link to="/login" onClick={onClose} className="w-full py-2 text-center bg-indigo-200 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-indigo-300 transition-colors">
               Login / Register
             </Link>
           ) : (
             <>
               {isGuest ? (
                 <div className="text-center font-bold text-sm mb-2 text-black/60 flex items-center justify-center gap-2">Mode Guest <Ghost className="w-4 h-4" /></div>
               ) : (
                 <Link to="/users/profile" onClick={onClose} className="flex items-center gap-2 p-2 mb-2 hover:bg-gray-200 rounded-lg transition-colors border-2 border-transparent">
                    {userData?.photoURL ? (
                       <img src={userData.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-black object-cover" />
                    ) : (
                       <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-black flex items-center justify-center font-bold text-sm">
                         {userData?.displayName ? userData.displayName[0].toUpperCase() : (userData?.username ? userData.username[0].toUpperCase() : 'U')}
                       </div>
                    )}
                    <div className="font-bold text-sm truncate flex-1">{userData?.displayName || userData?.username || 'User'}</div>
                    <UserIcon className="w-4 h-4" />
                 </Link>
               )}
               {isDocsPage && (
                 <Link to={isGuest ? "/calculator" : "/users/dashboard"} onClick={onClose} className="w-full py-2 flex items-center justify-center gap-2 text-center bg-indigo-200 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-indigo-300 transition-colors">
                   Buka Aplikasi <ChevronRight className="w-4 h-4" />
                 </Link>
               )}
               {!isDocsPage && (
                 <Link to="/docs" onClick={onClose} className="w-full py-2 flex items-center justify-center gap-2 text-center bg-gray-200 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-300 transition-colors">
                   <Book className="w-4 h-4" /> Dokumentasi
                 </Link>
               )}
               <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-2 flex items-center justify-center gap-2 text-center bg-red-200 border-2 border-black rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-300 transition-colors"
               >
                 <LogOut className="w-4 h-4" /> Keluar Akun
               </button>
             </>
           )}
        </div>
      </div>
    </>
  );
}

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { currentUser, userData, isGuest } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      id="main-header"
      className="sticky top-0 z-30 px-4 py-3 flex items-center justify-between"
      style={{
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0)',
        backdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
        borderBottom: isScrolled ? '4px solid black' : '4px solid transparent',
        boxShadow: isScrolled ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        WebkitBackdropFilter: isScrolled ? 'blur(12px)' : 'blur(0px)',
      }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20 relative p-1 overflow-hidden">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain [image-rendering:pixelated]" 
          />
        </div>
        <div 
          className="font-black text-xl tracking-tight whitespace-nowrap z-10"
          style={{
            opacity: isScrolled ? 1 : 0,
            pointerEvents: isScrolled ? 'auto' : 'none',
            transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          Dear Me
        </div>
      </div>

      <div className="flex items-center gap-3 relative z-20">
        {currentUser && !isGuest && (
          <Link to={location.pathname === '/users/profile' ? '/users/dashboard' : '/users/profile'} className="w-10 h-10 rounded-full bg-amber-200 border-4 border-black flex items-center justify-center font-bold text-sm hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
             {userData?.photoURL ? (
                <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                userData?.displayName ? userData.displayName[0].toUpperCase() : (userData?.username ? userData.username[0].toUpperCase() : 'U')
             )}
          </Link>
        )}
        <button onClick={toggleSidebar} className="w-10 h-10 bg-pink-300 rounded-2xl border-4 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform">
          <Menu className="w-5 h-5 text-black" />
        </button>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-8 text-black/60 font-bold text-sm flex flex-col items-center gap-3 py-6 border-t border-black/10">
      <p>© 2026 Made With Love by ramadanny</p>
      <div className="flex gap-4">
        <a href="https://wa.me/380998189175" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-transform hover:scale-110" aria-label="WhatsApp">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
        </a>
        <a href="https://www.github.com/ramadanny" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-transform hover:scale-110" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
        </a>
      </div>
    </footer>
  );
}
