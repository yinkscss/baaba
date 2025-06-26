import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NavBar } from '../components/ui/tubelight-navbar';
import { StackedCircularFooter } from '../components/ui/stacked-circular-footer';
import { StickySignIn } from '../components/ui/sticky-signin';
import { RoommateIcon } from '../components/icons/RoommateIcon';
import { HomeIcon } from '../components/icons/HomeIcon';
import { BuildingIcon } from '../components/icons/BuildingIcon';
import { LegalIcon } from '../components/icons/LegalIcon';
import { useAuth } from '../context/AuthContext';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isRoommatePage = location.pathname === '/roommate-matching';

  const navItems = [
    { name: 'Home', url: '/', icon: HomeIcon },
    { name: 'Properties', url: '/properties', icon: BuildingIcon },
    { name: 'Roommates', url: '/roommate-matching', icon: RoommateIcon },
    { name: 'Legal', url: '/legal-assistant', icon: LegalIcon }
  ];

  return (
    <div className={`flex min-h-screen flex-col bg-background text-text-primary ${
      isRoommatePage ? 'bg-black' : ''
    }`}>
      {/* Desktop Header - Fixed and Transparent */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 w-full bg-transparent">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center">
            <img 
              src="/BAABA NAME copy.png" 
              alt="BAABA.ng" 
              className="h-6 w-auto"
            />
          </Link>
          
          <NavBar items={navItems} isFixed={false} className="mx-auto" />
          
          <StickySignIn isFixed={false} />
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <NavBar items={navItems} isFixed={true} />
        <StickySignIn isFixed={true} />
      </div>

      <main className={`flex-1 ${isRoommatePage ? '' : 'pt-16 md:pt-20'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <StackedCircularFooter />
    </div>
  );
};

export default MainLayout;