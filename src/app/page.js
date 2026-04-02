'use client';
import { ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { BlurText } from '../components/ReactBits/BlurText';
import { Magnetic } from '../components/ReactBits/Magnetic';
import './home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="noise-bg"></div>
      <div className="noise-overlay"></div>
      
      <section className="hero container">
         <div className="hero-content">
            <h1 className="hero-title">
               <BlurText text="Experience Premium" delay={0.1} />
               <BlurText text="Medical Care" delay={0.3} />
            </h1>
            
            <p className="hero-subtitle">
               An award-winning patient portal offering precise 30-minute booking grids and bespoke medical histories, designed strictly for the modern era.
            </p>

            <div className="hero-actions">
               <Magnetic>
                 <Link href="/book" className="btn-primary" style={{gap: '0.5rem'}}>
                    Book Appointment <ArrowRight size={20} />
                 </Link>
               </Magnetic>
               <Magnetic>
                 <Link href="/register" className="btn-secondary">
                    Access Portal
                 </Link>
               </Magnetic>
            </div>
            
            <div className="stats-bar">
               <div className="stat-group">
                  <span className="stat-value">5+</span>
                  <span className="stat-label">Specialists</span>
               </div>
               <div className="stat-group">
                  <span className="stat-value">30m</span>
                  <span className="stat-label">Precise Slots</span>
               </div>
               <div className="stat-group">
                  <span className="stat-value">24/7</span>
                  <span className="stat-label">Digital Records</span>
               </div>
            </div>
         </div>
         
         <div className="hero-visual">
            <div className="visual-graphic">
               <img src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=600&auto=format&fit=crop" alt="Premium Clinic" className="hero-image" />
               <div className="floating-card top-right glow">
                  <Activity className="icon" size={24}/>
                  <div>
                     <strong>Fast Booking</strong>
                     <span>Under 2 minutes</span>
                  </div>
               </div>
               <div className="floating-card bottom-left glow">
                  <ShieldCheck className="icon" size={24}/>
                  <div>
                     <strong>Secure Records</strong>
                     <span>HIPAA Compliant</span>
                  </div>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}
