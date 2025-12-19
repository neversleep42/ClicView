'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const Header = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-primary)]" 
      style={{ 
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)'
      }}>
      <div className="max-w-7xl mx-auto px-4 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link href="/landing" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-green)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-lg text-[var(--text-primary)]">SupportAI</span>
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => scrollToSection('features')}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('channels')}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Channels
          </button>
          <button 
            onClick={() => scrollToSection('pricing')}
            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Pricing
          </button>
        </nav>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link 
            href="/login"
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="btn btn-primary text-sm px-5 py-2.5 group"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
