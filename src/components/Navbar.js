'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import './Navbar.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Hide the marketing navbar inside all portal dashboards
  if (pathname && (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/doctor/dashboard') ||
    pathname.startsWith('/dashboard')
  )) {
    return null;
  }

  return (
    <nav className="navbar-container">
      <div className="navbar editorial-nav">
        <Link href="/" className="logo">
          <Calendar className="logo-icon" size={28} />
          <span>DocCare</span>
        </Link>
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <Link href="/doctors" className="nav-link">Doctors</Link>
          <Link href="/services" className="nav-link">Services</Link>
          <Link href="/about" className="nav-link">About</Link>
          <div className="nav-actions mobile-only-actions">
             <Link href="/login" className="btn-secondary">Log in</Link>
             <Link href="/book" className="btn-primary">Book Now</Link>
          </div>
        </div>
        <div className="nav-actions desktop-only-actions">
          <Link href="/login" className="btn-secondary">Log in</Link>
          <Link href="/book" className="btn-primary">Book Now</Link>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
    </nav>
  );
}
