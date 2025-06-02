import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Settings, LogOut, Users, Building, FileText, 
  CreditCard, ChevronDown, Menu, X, User as UserIcon
} from 'lucide-react';
import { LogoIcon } from '../components/icons/LogoIcon';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isTenant = user?.role === 'tenant';

  const navItems = isTenant
    ? [
        { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard/tenant' },
        { icon: <Building size={20} />, label: 'Properties', path: '/properties' },
        { icon: <Users size={20} />, label: 'Roommate Matching', path: '/roommate-matching' },
        { icon: <FileText size={20} />, label: 'Legal Assistant', path: '/legal-assistant' },
        { icon: <CreditCard size={20} />, label: 'Subscription', path: '/subscription' },
      ]
    : [
        { icon: <Home size={20} />, label: 'Dashboard', path: '/dashboard/landlord' },
        { icon: <Building size={20} />, label: 'My Properties', path: '/dashboard/landlord' },
        { icon: <FileText size={20} />, label: 'Add Property', path: '/dashboard/landlord/add-property' },
        { icon: <Users size={20} />, label: 'Tenant Applications', path: '/dashboard/landlord/applications' },
        { icon: <CreditCard size={20} />, label: 'Payments', path: '/dashboard/landlord/payments' },
      ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  return (
    <div className="flex h-screen bg-background text-text-primary">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-shrink-0 bg-card shadow-lg md:block">
        <div className="flex h-16 items-center px-6">
          <Link to="/" className="flex items-center space-x-2">
            <LogoIcon className="h-8 w-8 text-accent-blue" />
            <span className="text-xl font-bold">BAABA.COM</span>
          </Link>
        </div>
        
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex w-full items-center space-x-3 rounded-md p-3 transition-colors ${
                    location.pathname === item.path
                      ? 'bg-nav text-accent-blue'
                      : 'text-text-secondary hover:bg-nav/50 hover:text-text-primary'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-nav bg-card px-6">
          {/* Mobile menu button */}
          <button 
            onClick={toggleMenu} 
            className="text-text-primary hover:text-accent-blue md:hidden"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Page title - visible on desktop */}
          <h1 className="hidden text-xl font-semibold md:block">
            {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>

          {/* Mobile logo - visible when menu is closed */}
          {!isMenuOpen && (
            <div className="flex items-center md:hidden">
              <LogoIcon className="h-8 w-8 text-accent-blue" />
            </div>
          )}

          {/* User menu */}
          <div className="relative">
            <button 
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 rounded-full bg-nav p-2 text-text-primary hover:bg-nav/70"
            >
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={`${user.firstName} ${user.lastName}`} 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue text-background">
                  <UserIcon size={16} />
                </div>
              )}
              <span className="hidden md:block">{user.firstName}</span>
              <ChevronDown size={16} className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isProfileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-nav focus:outline-none"
                >
                  <div className="py-1">
                    <Link 
                      to="/settings" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-text-secondary hover:bg-nav hover:text-text-primary"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-error-DEFAULT hover:bg-nav"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 bg-background md:hidden"
            >
              <div className="flex h-16 items-center justify-between border-b border-nav px-6">
                <Link to="/" className="flex items-center space-x-2">
                  <LogoIcon className="h-8 w-8 text-accent-blue" />
                  <span className="text-xl font-bold">BAABA.COM</span>
                </Link>
                <button onClick={toggleMenu} className="text-text-primary hover:text-accent-blue">
                  <X size={24} />
                </button>
              </div>
              <nav className="p-6">
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-4 rounded-md p-3 transition-colors ${
                          location.pathname === item.path
                            ? 'bg-nav text-accent-blue'
                            : 'text-text-secondary hover:bg-nav/50 hover:text-text-primary'
                        }`}
                        onClick={toggleMenu}
                      >
                        {item.icon}
                        <span className="text-lg">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;