import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, LogOut, Users, Building, FileText, 
  CreditCard, ChevronDown, User as UserIcon,
  Home, Plus, Bell, Key, DollarSign,
  LayoutGrid
} from 'lucide-react';
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
  const isAgent = user?.role === 'agent';
  const isLandlord = user?.role === 'landlord';

  // Define navigation items based on user role
  const dashboardNavItems = isTenant
    ? [
        { title: 'Dashboard', icon: Home },
        { title: 'Housing Status', icon: Key },
        { type: 'separator' as const },
        { title: 'Payments', icon: CreditCard },
        { title: 'Properties', icon: Building },
        { title: 'Roommates', icon: Users },
        { type: 'separator' as const },
        { title: 'Legal Assistant', icon: FileText },
        { title: 'Complaints', icon: Bell },
      ]
    : isAgent
    ? [
        { title: 'Dashboard', icon: Home },
        { title: 'Managed Properties', icon: LayoutGrid },
        { type: 'separator' as const },
        { title: 'Add Property', icon: Plus },
        { title: 'Inspection Requests', icon: Bell },
        { title: 'Payments/Earnings', icon: DollarSign },
        { type: 'separator' as const },
        { title: 'Commissions', icon: CreditCard },
      ]
    : [
        { title: 'Dashboard', icon: Home },
        { title: 'My Properties', icon: LayoutGrid },
        { type: 'separator' as const },
        { title: 'Add Property', icon: Plus },
        { title: 'Inspection Requests', icon: Bell },
        { title: 'Payments/Earnings', icon: DollarSign },
      ];

  const handleTabChange = (index: number | null) => {
    if (index === null) return;
    
    const tab = dashboardNavItems[index];
    if (tab.type === 'separator') return;

    // Define path mappings for each role
    const tenantPathMap = {
      'Dashboard': '/dashboard/tenant',
      'Housing Status': '/dashboard/tenant/housing-status',
      'Payments': '/dashboard/tenant/payments',
      'Properties': '/dashboard/tenant/properties',
      'Roommates': '/dashboard/tenant/roommate-matching',
      'Legal Assistant': '/dashboard/tenant/legal-assistant',
      'Complaints': '/dashboard/tenant/complaints'
    };

    const agentPathMap = {
      'Dashboard': '/dashboard/agent',
      'Managed Properties': '/dashboard/agent/managed-properties',
      'Add Property': '/dashboard/landlord/add-property', // Reuse landlord's add property
      'Inspection Requests': '/dashboard/agent/inspection-requests',
      'Payments/Earnings': '/dashboard/agent/payments-earnings',
      'Commissions': '/dashboard/agent/commissions'
    };

    const landlordPathMap = {
      'Dashboard': '/dashboard/landlord',
      'My Properties': '/dashboard/landlord/my-properties',
      'Add Property': '/dashboard/landlord/add-property',
      'Inspection Requests': '/dashboard/landlord/inspection-requests',
      'Payments/Earnings': '/dashboard/landlord/payments-earnings'
    };

    let pathMap;
    if (isTenant) {
      pathMap = tenantPathMap;
    } else if (isAgent) {
      pathMap = agentPathMap;
    } else {
      pathMap = landlordPathMap;
    }

    const path = pathMap[tab.title];
    if (path) {
      navigate(path);
    }
  };

  // Get role-specific settings path
  const getSettingsPath = () => {
    if (isTenant) return '/dashboard/tenant/settings';
    if (isAgent) return '/dashboard/agent/settings';
    return '/dashboard/landlord/settings';
  };

  // Get role display name
  const getRoleDisplayName = () => {
    if (isTenant) return 'Student';
    if (isAgent) return 'Agent';
    return 'Landlord';
  };

  return (
    <div className="flex h-screen bg-background text-text-primary">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-nav bg-card px-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <img 
                src="/BAABA NAME copy.png" 
                alt="BAABA.ng" 
                className="h-5 w-auto"
              />
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
              <div className="hidden md:block text-left">
                <span className="block text-sm font-medium">{user.firstName}</span>
                <span className="block text-xs text-text-secondary">{getRoleDisplayName()}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-nav focus:outline-none">
                <div className="py-1">
                  <Link 
                    to={getSettingsPath()}
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
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;