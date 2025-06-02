import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LogoIcon } from '../icons/LogoIcon';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

interface NavbarProps {
  scrolled: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ scrolled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'Legal Assistant', path: '/legal-assistant' },
    { name: 'Pricing', path: '/subscription' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'tenant' ? '/dashboard/tenant' : '/dashboard/landlord';
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-card shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between md:h-20">
          <Link to="/" className="flex items-center space-x-2">
            <LogoIcon className="h-8 w-8" />
            <span className="text-xl font-bold text-text-primary">BAABA.COM</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden space-x-4 md:flex">
            {user ? (
              <Button
                onClick={() => navigate(getDashboardLink())}
                variant="primary"
                size="sm"
              >
                <User size={16} className="mr-2" />
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => navigate('/login')}
                  variant="secondary"
                  size="sm"
                >
                  <LogIn size={16} className="mr-2" />
                  Log In
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  variant="primary"
                  size="sm"
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="text-text-primary hover:text-accent-blue md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
          >
            <nav className="container mx-auto bg-card px-4 pb-6">
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="block py-2 text-text-secondary hover:text-text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li className="pt-4">
                  {user ? (
                    <Button
                      onClick={() => {
                        navigate(getDashboardLink());
                        setIsMenuOpen(false);
                      }}
                      variant="primary"
                      className="w-full"
                    >
                      <User size={16} className="mr-2" />
                      Dashboard
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Button
                        onClick={() => {
                          navigate('/login');
                          setIsMenuOpen(false);
                        }}
                        variant="secondary"
                        className="w-full"
                      >
                        <LogIn size={16} className="mr-2" />
                        Log In
                      </Button>
                      <Button
                        onClick={() => {
                          navigate('/register');
                          setIsMenuOpen(false);
                        }}
                        variant="primary"
                        className="w-full"
                      >
                        Register
                      </Button>
                    </div>
                  )}
                </li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;