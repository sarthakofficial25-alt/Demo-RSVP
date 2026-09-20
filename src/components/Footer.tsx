import React from 'react';
import { Linkedin, Instagram, Github, Heart } from 'lucide-react';
import { EVENT_DATA } from '../data/eventData.ts';
import { GdgLogo } from './GdgLogo.tsx';

interface FooterProps {
  onNavClick: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer id="main-footer" className="bg-white border-t border-gray-200 py-12 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Community Text */}
          <div className="text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <GdgLogo className="h-5 w-auto" />
              <span className="font-bold text-gray-900 text-base">
                {EVENT_DATA.organizer}
              </span>
            </div>
            <p className="text-xs text-gray-700">
              {EVENT_DATA.event} • 10 October 2026 • Sonarpur, Kolkata
            </p>
            <p className="text-xs text-gray-700 pt-1">
              Built for the developer community.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6" aria-label="Footer Navigation">
            {EVENT_DATA.footerLinks.map((link) => (
              <button
                key={link.name}
                id={`footer-link-${link.name.toLowerCase()}`}
                onClick={() => onNavClick(link.href.replace('#', ''))}
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a
              id="social-linkedin-link"
              href="https://www.linkedin.com/search/results/all/?keywords=GDG%20on%20Campus%20FIEM"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              id="social-instagram-link"
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-2 text-gray-600 hover:text-pink-700 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              id="social-github-link"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 text-gray-600 hover:text-gray-950 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600 gap-2">
          <p>© 2026 GDG on Campus FIEM. An independent developer community event.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for FIEM student developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
