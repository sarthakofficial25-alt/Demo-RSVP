import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogIn, LogOut, Ticket, ChevronDown } from 'lucide-react';
import { EVENT_DATA } from '../data/eventData.ts';
import { GdgLogo } from './GdgLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  onRsvpClick?: () => void;
  hasRegistration?: boolean;
  onViewPass?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRsvpClick,
  hasRegistration,
  onViewPass,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, userProfile, openAuthModal, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Agenda', href: '#agenda' },
    { name: 'Speakers', href: '#speakers' },
    { name: 'Venue', href: '#venue' },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const displayName =
    userProfile?.displayName ||
    user?.displayName ||
    (user?.email ? user.email.split('@')[0] : 'Developer');

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-40 w-full bg-white transition-all duration-200 ${
        scrolled ? 'shadow-xs border-b border-gray-200/80' : 'border-b border-gray-200'
      } no-print`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Organizer Name */}
          <a
            id="brand-logo-link"
            href="#"
            className="flex items-center gap-3 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
          >
            {/* GDG Google Colors Brand Icon */}
            <GdgLogo className="h-6 sm:h-7 w-auto transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-medium text-gray-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                {EVENT_DATA.organizer}
              </span>
              <span className="text-xs text-gray-700 hidden sm:block">
                Build With AI 2026
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <button
                key={link.name}
                id={`nav-link-${link.name.toLowerCase()}`}
                onClick={() => handleNavClick(link.href)}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors py-1 cursor-pointer"
              >
                {link.name}
              </button>
            ))}

            {/* Auth Dropdown or Sign In */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="navbar-profile-dropdown-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-[11px] text-gray-400">Signed In</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {hasRegistration && (
                        <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                          <Ticket className="w-3 h-3" /> RSVP Confirmed
                        </span>
                      )}
                    </div>

                    {hasRegistration && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (onViewPass) onViewPass();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Ticket className="w-4 h-4 text-blue-600" />
                        View Attendee Pass
                      </button>
                    )}

                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        await signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="navbar-signin-btn"
                onClick={() => openAuthModal('signin')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-blue-700 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                Sign In
              </button>
            )}

            {user && hasRegistration ? (
              <button
                id="navbar-view-pass-btn"
                onClick={onViewPass}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
              >
                View Registration
              </button>
            ) : (
              <a
                id="navbar-rsvp-btn"
                href="#rsvp"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#rsvp');
                  if (onRsvpClick) onRsvpClick();
                }}
                className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white bg-[#4285F4] rounded-md hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                RSVP
              </a>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {!user && (
              <button
                onClick={() => openAuthModal('signin')}
                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded border border-blue-200"
              >
                Sign In
              </button>
            )}
            {user && hasRegistration && (
              <button
                id="mobile-view-pass-icon-btn"
                onClick={onViewPass}
                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded border border-blue-200"
              >
                My Pass
              </button>
            )}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle Navigation Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div id="mobile-menu-drawer" className="md:hidden border-b border-gray-200 bg-white px-4 pt-2 pb-5 space-y-2">
          {/* User profile section for mobile */}
          {user ? (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await signOut();
                }}
                className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-white"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-900">Build With AI Account</p>
                <p className="text-[11px] text-blue-700">Sign in to manage your attendee pass</p>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal('signin');
                }}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg shadow-2xs"
              >
                Sign In
              </button>
            </div>
          )}

          {navLinks.map((link) => (
            <button
              key={link.name}
              id={`mobile-nav-${link.name.toLowerCase()}`}
              onClick={() => handleNavClick(link.href)}
              className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
            >
              {link.name}
            </button>
          ))}
          <div className="pt-2 border-t border-gray-100">
            {user && hasRegistration ? (
              <button
                id="mobile-menu-view-pass-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onViewPass) onViewPass();
                }}
                className="w-full text-center px-4 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md"
              >
                View Registration Pass
              </button>
            ) : (
              <button
                id="mobile-menu-rsvp-btn"
                onClick={() => {
                  handleNavClick('#rsvp');
                  if (onRsvpClick) onRsvpClick();
                }}
                className="w-full text-center px-4 py-2.5 text-sm font-medium text-white bg-[#4285F4] rounded-md hover:bg-blue-600"
              >
                RSVP for Build With AI
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
