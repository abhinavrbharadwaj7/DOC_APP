'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock } from 'lucide-react';
import '../register/register.css';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '', password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side visual mock routing for testing
    const email = formData.email.toLowerCase();
    if (email.includes('doctor')) {
      router.push('/doctor/dashboard');
    } else if (email.includes('admin')) {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card editorial-card animate-fade-in">
        <div className="auth-header">
          <div className="icon-wrapper"><LogIn size={32} /></div>
          <h2>Welcome Back</h2>
          <p>Log in to manage your appointments and records</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
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
            Log In
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Don't have an account? <Link href="/register" className="auth-link">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
}
