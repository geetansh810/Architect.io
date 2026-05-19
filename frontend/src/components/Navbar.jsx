import { useState } from 'react';
import { Link, useLocation, useNavigate, NavLink } from 'react-router-dom';
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

export default function Navbar({ user, onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (location.pathname === '/login') return null;

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate('/');
  };

  const navItemsPrivate = [
    { name: 'Projects', icon: LayoutDashboard, path: '/dashboard?tab=Projects' },
    { name: 'Templates', icon: Layers, path: '/templates' },
    { name: 'AI Builder', icon: Sparkles, path: '/dashboard?tab=AI Builder', badge: 'Soon' },
    { name: 'Documentation', icon: BookOpen, path: '/dashboard?tab=Documentation' },
  ];

  if (user?.role === 'Admin') {
    navItemsPrivate.splice(1, 0, { name: 'Admin Console', icon: Crown, path: '/admin' });
  }

  return (
    <>
      <header className="w-full fixed top-0 left-0 right-0 z-[100] bg-[var(--bg-app)]/90 backdrop-blur-xl border-b border-[var(--border-main)] transition-colors duration-300">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-3 group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform">
                <Box className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tighter">Architect.io</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {user ? navItemsPrivate.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => {
                    const isTabActive = item.path.includes('?')
                      ? location.search === `?tab=${item.name.replace(' ', '%20')}` || (location.pathname === item.path.split('?')[0] && !location.search && item.name === 'Projects')
                      : location.pathname === item.path;
                    return `px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${isTabActive
                      ? 'text-brand-500 bg-brand-500/10'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'
                      }`
                  }}
                >
                  <item.icon size={18} />
                  {item.name}
                  {item.badge && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-violet-500/15 text-violet-400 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              )) : (
                <div className="flex items-center gap-6 ml-4">
                  <a href="/#features" className="text-sm font-bold hover:text-brand-500 transition-colors">Features</a>
                  <a href="/#why-us" className="text-sm font-bold hover:text-brand-500 transition-colors">Why Us</a>
                  <a href="/#about" className="text-sm font-bold hover:text-brand-500 transition-colors">About</a>
                  <NavLink to="/docs" className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-brand-500 border-b-2 border-brand-500 pb-0.5' : 'hover:text-brand-500'}`}>Docs</NavLink>
                  <NavLink to="/templates" className={({ isActive }) => `text-sm font-bold transition-colors ${isActive ? 'text-brand-500 border-b-2 border-brand-500 pb-0.5' : 'hover:text-brand-500'}`}>Templates</NavLink>
                  <NavLink to="/demo" className={({ isActive }) => `text-sm font-bold transition-colors flex items-center gap-1.5 ${isActive ? 'text-amber-500 border-b-2 border-amber-500 pb-0.5' : 'text-amber-500 hover:text-amber-400'}`}>
                    <Sparkles size={14} className="fill-amber-500/20" />
                    Sandbox
                  </NavLink>
                  <a href="/#ai-builder" className="flex items-center gap-1.5 text-sm font-bold text-violet-500 hover:text-violet-400 transition-colors">
                    <Sparkles size={14} />
                    AI Builder
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-violet-500/15 text-violet-400 rounded-md leading-none">Soon</span>
                  </a>
                </div>
              )}
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

            {user ? (
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
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              navigate('/profile');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold hover:bg-[var(--bg-app)] transition-all"
                          >
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
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold hover:text-brand-500 transition-colors px-4 py-2">
                  Login
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login?mode=signup"
                    className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-brand-500/20 transition-all"
                  >
                    Start Free
                  </Link>
                </motion.div>
              </div>
            )}

            <button
              className="md:hidden p-2 hover:bg-[var(--bg-surface)] rounded-xl transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-[var(--bg-app)] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {user ? (
                <>
                  {navItemsPrivate.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="text-2xl font-black flex items-center gap-3 hover:text-brand-500 transition-colors"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <item.icon size={24} className="text-brand-500" />
                      {item.name}
                    </Link>
                  ))}
                  <div className="h-px bg-[var(--border-main)] my-4" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-500 font-black text-2xl"
                  >
                    <LogOut className="w-6 h-6" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <a href="/#features" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">Features</a>
                  <a href="/#process" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">Process</a>
                  <a href="/#about" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">About</a>
                  <Link to="/docs" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">Docs</Link>
                  <Link to="/templates" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black hover:text-brand-500 transition-colors">Templates</Link>
                  <Link to="/demo" onClick={() => setShowMobileMenu(false)} className="text-2xl font-black text-amber-500 flex items-center gap-2">
                    <Sparkles size={20} className="fill-amber-500/20" />
                    Sandbox
                  </Link>
                  <div className="h-px bg-[var(--border-main)] my-4" />
                  <Link
                    to="/login?mode=signup"
                    onClick={() => setShowMobileMenu(false)}
                    className="text-2xl font-black text-brand-500"
                  >
                    Start Designing Free
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
