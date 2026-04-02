'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './book.css';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
];

export default function BookAppointment() {
  const router = useRouter();
  const params = useSearchParams();
  const doctorId = params.get('doctorId');
  const doctorName = params.get('doctorName') || 'Doctor';
  const specialty = params.get('specialty') || 'General';

  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: false });

  useEffect(() => {
    const saved = localStorage.getItem('doccare_user');
    if (saved) setUser(JSON.parse(saved));
    else router.push('/login');
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !reason) {
      setStatus({ loading: false, error: 'Please fill all fields.', success: false });
      return;
    }
    setStatus({ loading: true, error: '', success: false });

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: user?.id,
        doctorId,
        date: selectedDate,
        slot: selectedSlot,
        reason,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus({ loading: false, error: data.error, success: false });
    } else {
      setStatus({ loading: false, error: '', success: true });
    }
  };

  if (status.success) {
    return (
      <div className="book-container">
        <motion.div className="book-card editorial-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <CheckCircle size={64} color="var(--primary)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Booked!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <strong>{selectedSlot}</strong> on <strong>{selectedDate}</strong>
            </p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>with <strong>{doctorName}</strong></p>
            <button className="btn-primary" onClick={() => router.push('/dashboard')}>View My Appointments</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="book-container">
      <motion.div className="book-card editorial-card"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="book-header">
          <h2>Book Appointment</h2>
          <p>with <strong style={{ color: 'var(--primary)' }}>{doctorName}</strong> — {specialty}</p>
        </div>

        {status.error && (
          <div className="auth-alert error"><AlertCircle size={18} /> {status.error}</div>
        )}

        <form onSubmit={handleBook} className="book-form">
          <div className="input-group">
            <label><CalendarDays size={16} /> Select Date</label>
            <input type="date" value={selectedDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setSelectedDate(e.target.value)}
              style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '1rem', width: '100%' }}
              required />
          </div>

          <div className="input-group">
            <label><Clock size={16} /> Select 30-Min Slot</label>
            <div className="slots-grid">
              {TIME_SLOTS.map(slot => (
                <button key={slot} type="button"
                  className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot)}>
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Reason for Visit</label>
            <textarea
              placeholder="Briefly describe your symptoms or reason..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '1rem', width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
              required />
          </div>

          <button type="submit" className="btn-primary-large submit-btn" disabled={status.loading || !selectedSlot}>
            {status.loading ? 'Booking...' : 'Confirm Appointment'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
