import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
      <NavBar items={navItems} />
      {!user && <StickySignIn />}
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