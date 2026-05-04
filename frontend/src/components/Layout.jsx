// Architect.io Layout Component
import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Box, 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronDown,
  User,
  Settings,
  Bell,
  X,
  Menu,
  Sparkles,
  Crown
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('architect_user') || '{}');
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('architect_user');
    if (onLogout) onLogout();
    navigate('/');
  };

  const navItems = [
    { name: 'Projects', icon: LayoutDashboard, path: '/dashboard?tab=Projects' },
    { name: 'Templates', icon: Layers, path: '/dashboard?tab=Templates' },
    { name: 'AI Builder', icon: Sparkles, path: '/dashboard?tab=AI Builder', badge: 'Soon' },
    { name: 'Documentation', icon: BookOpen, path: '/dashboard?tab=Documentation' },
  ];

  // Add Admin Console for Admins only
  if (user.role === 'Admin') {
    navItems.splice(1, 0, { name: 'Admin Console', icon: Crown, path: '/admin' });
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      {/* Navbar */}
      <header className="h-20 border-b border-[var(--border-main)] bg-[var(--bg-surface)] px-6 flex items-center justify-between z-50 shrink-0">
        <div className="flex items-center gap-12">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
              <Box className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight">Architect.io</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                  location.pathname === item.path 
                  ? 'bg-brand-500/10 text-brand-500' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
                }`}
              >
                <item.icon size={18} />
                {item.name}
                {item.badge && (
                  <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-violet-500/15 text-violet-400 rounded-md">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-3 hover:bg-[var(--bg-app)] rounded-2xl transition-all text-[var(--text-muted)] hover:text-brand-500"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="h-8 w-px bg-[var(--border-main)] mx-2 hidden sm:block" />

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 hover:bg-[var(--bg-app)] rounded-2xl transition-all group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black leading-tight">{user.name || user.email || 'User'}</p>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{user.role || 'Architect'}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500 font-black border-2 border-transparent group-hover:border-brand-500/50 transition-all">
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <ChevronDown size={16} className={`text-[var(--text-muted)] transition-transform duration-300 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-[2rem] shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-6 border-b border-[var(--border-main)] bg-[var(--bg-sidebar)]">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-brand-500/20">
                          {(user.name || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-lg">{user.name || 'User'}</p>
                          <p className="text-xs text-[var(--text-muted)] font-medium">{user.email || ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg w-fit">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{user.role || 'Architect'}</span>
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-[var(--bg-app)] transition-all">
                        <User size={18} className="text-[var(--text-muted)]" />
                        Profile Settings
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-[var(--bg-app)] transition-all text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" 
              onClick={() => setShowMobileMenu(false)} 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-20 right-0 bottom-0 w-64 bg-[var(--bg-surface)] border-l border-[var(--border-main)] p-6 shadow-2xl z-50 md:hidden"
            >
               <div className="space-y-6">
                  <nav className="flex flex-col gap-4">
                    {navItems.map((item) => (
                      <Link 
                        key={item.name}
                        to={item.path} 
                        className="text-lg font-bold flex items-center gap-3" 
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <item.icon size={20} className="text-brand-500" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="h-px bg-[var(--border-main)]" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-500 font-bold"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
