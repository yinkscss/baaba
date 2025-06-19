import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogoIcon } from '../icons/LogoIcon';
import Button from './Button';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface MobileNavProps {
  items: NavItem[];
}

export function MobileNav({ items }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getSettingsPath = () => {
    if (user?.role === 'tenant') return '/dashboard/tenant/settings';
    if (user?.role === 'agent') return '/dashboard/agent/settings';
    return '/dashboard/landlord/settings';
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex items-center justify-center p-2 rounded-full bg-nav/50 text-text-primary hover:bg-nav"
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 md:hidden"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-xs bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <LogoIcon className="h-8 w-8 mr-2" />
                    <img 
                      src="/BAABA NAME copy.png" 
                      alt="BAABA.ng" 
                      className="h-5 w-auto"
                    />
                  </div>
                  <button
                    onClick={toggleMenu}
                    className="p-2 rounded-full bg-nav/50 text-text-primary hover:bg-nav"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User info */}
                {user && (
                  <div className="mb-6 p-4 rounded-lg bg-nav/30">
                    <div className="flex items-center gap-3">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={`${user.firstName} ${user.lastName}`} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-blue text-background">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-text-primary">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation items */}
                <nav className="flex-1 space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-nav hover:text-text-primary transition-colors"
                      onClick={toggleMenu}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </nav>

                {/* Footer actions */}
                <div className="mt-auto pt-6 space-y-3">
                  <Link
                    to={getSettingsPath()}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-text-secondary hover:bg-nav hover:text-text-primary transition-colors"
                    onClick={toggleMenu}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut size={18} className="mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}