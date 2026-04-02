'use client';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { usePathname } from 'next/navigation';
import './Navbar.css';

export default function Navbar() {
  const pathname = usePathname();

  // Hide the marketing navbar inside the Admin portal as it has a dedicated full-screen layout
  if (pathname && pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="navbar-container">
      <div className="navbar editorial-nav">
        <Link href="/" className="logo">
          <Calendar className="logo-icon" size={28} />
          <span>DocCare</span>
        </Link>
        <div className="nav-links">
          <Link href="/doctors" className="nav-link">Doctors</Link>
          <Link href="/services" className="nav-link">Services</Link>
          <Link href="/about" className="nav-link">About</Link>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="btn-secondary">Log in</Link>
          <Link href="/book" className="btn-primary">Book Now</Link>
        </div>
      </div>
    </nav>
  );
}
