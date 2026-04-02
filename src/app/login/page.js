'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import '../register/register.css';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ loading: false, error: data.error, success: '' });
        return;
      }

      // Save user to localStorage for session use
      localStorage.setItem('doccare_user', JSON.stringify(data.user));

      setStatus({ loading: false, error: '', success: `Welcome back, ${data.user.name}!` });

      // Route based on role
      setTimeout(() => {
        if (data.user.role === 'doctor') router.push('/doctor/dashboard');
        else if (data.user.role === 'admin') router.push('/admin/dashboard');
        else router.push('/dashboard');
      }, 800);

    } catch (err) {
      setStatus({ loading: false, error: 'Network error. Please try again.', success: '' });
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

        {status.error && (
          <div className="auth-alert error">
            <AlertCircle size={18} /> {status.error}
          </div>
        )}
        {status.success && (
          <div className="auth-alert success">
            <CheckCircle size={18} /> {status.success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary-large submit-btn" disabled={status.loading}>
            {status.loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link href="/register" className="auth-link">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
}
