import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, LogOut, Users, Building, FileText, 
  CreditCard, ChevronDown, User as UserIcon,
  Home, Plus, Bell
} from 'lucide-react';
import { LogoIcon } from '../components/icons/LogoIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandableTabs } from '../components/ui/expandable-tabs';

const DashboardLayout: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const dashboardNavItems = isTenant
    ? [
        { title: 'Dashboard', icon: Home },
        { title: 'Properties', icon: Building },
        { type: 'separator' as const },
        { title: 'Roommates', icon: Users },
        { title: 'Legal Assistant', icon: FileText },
        { title: 'Subscription', icon: CreditCard },
      ]
    : [
        { title: 'Dashboard', icon: Home },
        { title: 'My Properties', icon: Building },
        { type: 'separator' as const },
        { title: 'Add Property', icon: Plus },
        { title: 'Applications', icon: Users },
        { title: 'Payments', icon: CreditCard },
      ];

  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    
    const tab = dashboardNavItems[index];
    if (tab.type === 'separator') return;

    const pathMap = isTenant ? {
      'Dashboard': '/dashboard/tenant',
      'Properties': '/properties',
      'Roommates': '/dashboard/tenant/roommate-matching',
      'Legal Assistant': '/dashboard/tenant/legal-assistant',
      'Subscription': '/subscription'
    } : {
      'Dashboard': '/dashboard/landlord',
      'My Properties': '/dashboard/landlord',
      'Add Property': '/dashboard/landlord/add-property',
      'Applications': '/dashboard/landlord/applications',
      'Payments': '/dashboard/landlord/payments'
    };

    const path = pathMap[tab.title];
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-nav bg-card px-6">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <LogoIcon className="h-8 w-8 text-accent-blue" />
              <span className="text-xl font-bold">BAABA.COM</span>
            </Link>
            
            <ExpandableTabs
              tabs={dashboardNavItems}
              activeColor="text-accent-blue"
              className="border-nav bg-nav/10"
              onChange={handleTabChange}
            />
          </div>

          {/* User menu */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
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