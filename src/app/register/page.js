'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import './register.css';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', role: 'patient' });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: '' });

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus({ loading: false, error: data.error, success: '' });
        return;
      }

      setStatus({ loading: false, error: '', success: 'Account created! Redirecting to login...' });
      setTimeout(() => router.push('/login'), 1200);

    } catch (err) {
      setStatus({ loading: false, error: 'Network error. Please try again.', success: '' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card editorial-card animate-fade-in">
        <div className="auth-header">
          <div className="icon-wrapper"><UserPlus size={32} /></div>
          <h2>Create Account</h2>
          <p>Join DocCare to book your first appointment</p>
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
            <label>Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={20} />
              <input type="text" placeholder="John Doe" value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input type="email" placeholder="you@example.com" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </div>
          </div>

          <div className="input-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={20} />
              <input type="tel" placeholder="+91 98765 43210" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input type="password" placeholder="••••••••" value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })} required />
            </div>
          </div>

          <div className="input-group">
            <label>I am a...</label>
            <div className="input-wrapper">
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', padding: '0.5rem' }}>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary-large submit-btn" disabled={status.loading}>
            {status.loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link href="/login" className="auth-link">Log in here</Link></p>
        </div>
      </div>
    </div>
  );
}
