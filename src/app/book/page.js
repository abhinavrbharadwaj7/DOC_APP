'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarDays, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import './book.css';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
];

function BookAppointmentContent() {
  const router = useRouter();
  const params = useSearchParams();
  const doctorId = params.get('doctorId');
  const doctorName = params.get('doctorName') || 'Doctor';
  const specialty = params.get('specialty') || 'General';

  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [lockedSlots, setLockedSlots] = useState([]); // [{slot, patientId}]
  const [selectedSlot, setSelectedSlot] = useState('');
  const [lockExpires, setLockExpires] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState({ loading: false, error: '', success: false });

  useEffect(() => {
    const saved = localStorage.getItem('doccare_user');
    if (saved) setUser(JSON.parse(saved));
    else router.push('/login');
    if (!doctorId) router.push('/doctors');
  }, []);

  useEffect(() => {
    if (selectedDate && doctorId) {
      const fetchAvailability = async () => {
        try {
          const isoDate = new Date(selectedDate + 'T00:00:00').toISOString();
          const res = await fetch(`/api/appointments/booked?doctorId=${doctorId}&date=${isoDate}`);
          if (res.ok) {
            const data = await res.json();
            setBookedSlots(data.bookedSlots || []);
            setLockedSlots(data.lockedSlots || []);
            
            // Check if our selected slot is now taken by someone else
            if (data.bookedSlots?.includes(selectedSlot)) {
              setSelectedSlot('');
              setLockExpires(null);
            }
            const otherLock = data.lockedSlots?.find(l => l.slot === selectedSlot && l.patientId !== user?.id);
            if (otherLock) {
              setSelectedSlot('');
              setLockExpires(null);
            }
          }
        } catch (err) {
          console.error('Error fetching availability:', err);
        }
      };
      fetchAvailability();
      const interval = setInterval(fetchAvailability, 15000); // Polling every 15s
      return () => clearInterval(interval);
    }
  }, [selectedDate, doctorId, selectedSlot, user?.id]);

  // Timer Effect
  useEffect(() => {
    if (!lockExpires) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(lockExpires) - new Date()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        setSelectedSlot('');
        setLockExpires(null);
        setStatus({ loading: false, error: 'Your reservation has expired. Please select the slot again.', success: false });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockExpires]);

  const handleSlotClick = async (slot) => {
    if (status.loading) return;
    
    // If clicking the same slot, ignore or release?
    if (selectedSlot === slot) return;

    setStatus({ loading: true, error: '', success: false });
    try {
      const isoDate = new Date(selectedDate + 'T00:00:00').toISOString();
      const res = await fetch('/api/appointments/lock', {
        method: 'POST',
        body: JSON.stringify({ doctorId, date: isoDate, slot, patientId: user.id }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ loading: false, error: data.error, success: false });
      } else {
        setSelectedSlot(slot);
        setLockExpires(data.expiresAt);
        setStatus({ loading: false, error: '', success: false });
      }
    } catch (err) {
      setStatus({ loading: false, error: 'Connection error. Try again.', success: false });
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !reason) {
      setStatus({ loading: false, error: 'Please fill all fields.', success: false });
      return;
    }
    setStatus({ loading: true, error: '', success: false });

    // Send date as UTC midnight to avoid timezone shift in conflict detection
    const isoDate = new Date(selectedDate + 'T00:00:00').toISOString();

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId: user?.id,
        doctorId,
        date: isoDate,
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
            {lockExpires && timeLeft > 0 && (
              <div className="reservation-timer">
                Slot reserved! Remaining time: <strong>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</strong>
              </div>
            )}
            <div className="slots-grid">
              {TIME_SLOTS.map(slot => {
                const isBooked = bookedSlots.includes(slot);
                const activeLock = lockedSlots.find(l => l.slot === slot);
                const isLockedByOther = activeLock && activeLock.patientId !== user?.id;
                const isLockedByMe = activeLock && activeLock.patientId === user?.id;

                let stateClass = '';
                let label = slot;
                let isDisabled = false;

                if (isBooked) {
                  stateClass = 'booked';
                  isDisabled = true;
                } else if (isLockedByOther) {
                  stateClass = 'reserved';
                  isDisabled = true;
                } else if (selectedSlot === slot || isLockedByMe) {
                  stateClass = 'selected';
                }

                return (
                  <button key={slot} type="button"
                    className={`slot-btn ${stateClass}`}
                    onClick={() => handleSlotClick(slot)}
                    disabled={isDisabled}>
                    {label}
                    {isBooked && <span className="slot-badge">Booked</span>}
                    {isLockedByOther && <span className="slot-badge">Reserved</span>}
                    {isLockedByMe && !isBooked && <span className="slot-badge">Your Turn</span>}
                  </button>
                );
              })}
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

export default function BookAppointment() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading booking data...</div>}>
      <BookAppointmentContent />
    </Suspense>
  );
}
