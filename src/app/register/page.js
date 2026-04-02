'use client';
import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, Mail, Lock, Phone } from 'lucide-react';
import './register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Register attempt', formData);
    // Placeholder for API call
    alert('Registration workflow initialized!');
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="icon-wrapper"><UserPlus size={32} /></div>
          <h2>Join DocCare</h2>
          <p>Create your patient account to start booking appointments</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <UserPlus className="input-icon" size={20} />
              <input 
                type="text" 
                placeholder="John Doe"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={20} />
              <input 
                type="tel" 
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary-large submit-btn">
            Create Account
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? <Link href="/login" className="auth-link">Log in here</Link></p>
        </div>
      </div>
    </div>
  );
}
