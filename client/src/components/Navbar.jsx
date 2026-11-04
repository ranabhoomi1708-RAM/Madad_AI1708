import React, { useState } from 'react';
import { 
  Globe, 
  Search, 
  PlusCircle, 
  Gift, 
  Clock, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Menu, 
  X,
  Heart
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, user, setUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo matching the image */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ea580c] shadow-xs group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight">
              <span className="text-[#ea580c]">MADAD</span>{' '}
              <span className="text-[#16a34a]">Connect</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => handleNavClick('find-help')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'find-help' ? 'text-[#ea580c]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Help Feed
            </button>

            <button
              onClick={() => handleNavClick('request-help')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'request-help' ? 'text-[#ea580c]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ask for Help
            </button>

            <button
              onClick={() => handleNavClick('give-help')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'give-help' ? 'text-[#16a34a]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Offer Help
            </button>

            <button
              onClick={() => handleNavClick('track-request')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'track-request' ? 'text-[#1e3a8a]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Track Case
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`text-sm font-semibold transition-colors ${
                activePage === 'admin' ? 'text-[#1e3a8a]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin
            </button>
          </nav>

          {/* User Profile Icon on Far Right */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div 
                  onClick={() => handleNavClick('admin')}
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-xs flex items-center justify-center text-gray-700 cursor-pointer hover:border-[#ea580c] transition-colors"
                  title={`${user.full_name} (${user.role})`}
                >
                  <User className="w-5 h-5 stroke-[1.8]" />
                </div>
                <button
                  onClick={() => setUser(null)}
                  title="Logout"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className="w-10 h-10 rounded-full border border-gray-200 bg-white shadow-xs flex items-center justify-center text-gray-700 hover:text-[#ea580c] hover:border-[#ea580c] transition-colors"
                title="Sign In"
              >
                <User className="w-5 h-5 stroke-[1.8]" />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md px-4 py-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleNavClick('find-help')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#ea580c]"
          >
            Help Feed
          </button>
          <button
            onClick={() => handleNavClick('request-help')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-orange-50 hover:text-[#ea580c]"
          >
            Ask for Help
          </button>
          <button
            onClick={() => handleNavClick('give-help')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-green-50 hover:text-[#16a34a]"
          >
            Offer Help
          </button>
          <button
            onClick={() => handleNavClick('track-request')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#1e3a8a]"
          >
            Track Case Status
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Admin Dashboard
          </button>
          <button
            onClick={() => handleNavClick('safety')}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Safety Guidelines
          </button>
        </div>
      )}
    </header>
  );
}
