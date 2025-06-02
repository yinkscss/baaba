import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from '../icons/LogoIcon';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-nav py-12 text-text-secondary">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <LogoIcon className="h-8 w-8" />
              <span className="text-xl font-bold text-text-primary">BAABA.COM</span>
            </div>
            <p className="max-w-xs">
              AI-powered housing platform for Nigerian students. Find safe and affordable accommodation with legal protection.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" className="hover:text-accent-blue" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" className="hover:text-accent-blue" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="https://facebook.com" className="hover:text-accent-blue" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://youtube.com" className="hover:text-accent-blue" aria-label="YouTube">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/properties" className="hover:text-accent-blue">Properties</Link></li>
              <li><Link to="/roommate-matching" className="hover:text-accent-blue">Roommate Matching</Link></li>
              <li><Link to="/legal-assistant" className="hover:text-accent-blue">Legal Assistant</Link></li>
              <li><Link to="/subscription" className="hover:text-accent-blue">Subscription Plans</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/blog" className="hover:text-accent-blue">Blog</Link></li>
              <li><Link to="/faq" className="hover:text-accent-blue">FAQ</Link></li>
              <li><Link to="/legal-resources" className="hover:text-accent-blue">Legal Resources</Link></li>
              <li><Link to="/help-center" className="hover:text-accent-blue">Help Center</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-text-primary">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                <a href="mailto:support@baaba.com" className="hover:text-accent-blue">support@baaba.com</a>
              </li>
              <li className="flex items-center">
                <Phone size={16} className="mr-2" />
                <a href="tel:+2341234567890" className="hover:text-accent-blue">+234 123 456 7890</a>
              </li>
              <li className="mt-4">
                <p>Lagos, Nigeria</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-nav/50 pt-6 text-center">
          <p>&copy; {new Date().getFullYear()} BAABA.COM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;