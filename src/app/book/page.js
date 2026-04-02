'use client';
import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, User } from 'lucide-react';
import './book.css';

const TIME_SLOTS = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"];

export default function BookAppointment() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [doctorName, setDoctorName] = useState('a Specialist');

  // If a doctorId is passed, we would fetch it.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if(urlParams.has('doctorId')) {
        setDoctorName('Dr. ' + urlParams.get('doctorId') + ' (Mock)');
      }
    }
  }, []);

  const handleBooking = (e) => {
    e.preventDefault();
    setIsBooked(true);
  };

  if (isBooked) {
    return (
      <div className="book-container success-container">
        <div className="glass-panel success-card animate-fade-in">
          <CheckCircle2 color="var(--secondary)" size={64} className="success-icon" />
          <h2>Appointment Confirmed!</h2>
          <p>Your 30-minute consultation has been scheduled successfully.</p>
          <div className="summary-box">
             <p><strong>Doctor:</strong> {doctorName}</p>
             <p><strong>Date:</strong> {selectedDate}</p>
             <p><strong>Time:</strong> {selectedSlot}</p>
          </div>
          <p className="sms-notice">A confirmation SMS and later medical reports will be sent directly to your phone.</p>
          <button onClick={() => window.location.href = '/'} className="btn-primary-large">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-container">
      <div className="book-wrapper animate-fade-in">
        <div className="book-hero">
          <h1>Schedule Consultation</h1>
          <p>Book your 30-minute slot with {doctorName}</p>
        </div>
        
        <form onSubmit={handleBooking} className="book-card glass-panel">
          <div className="form-section">
            <h3 className="flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}><CalendarIcon size={20}/> Select Date</h3>
            <input 
              type="date" 
              className="date-picker input-modern" 
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="form-section">
            <h3 className="flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}><Clock size={20}/> Select 30-Min Time Slot</h3>
            <div className="slots-grid">
              {TIME_SLOTS.map(slot => (
                <button 
                  key={slot} 
                  type="button"
                  className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3 className="flex-center" style={{justifyContent: 'flex-start', gap: '0.5rem'}}><User size={20}/> Reason for Visit</h3>
            <textarea 
              className="input-modern" 
              rows="4" 
              placeholder="Briefly describe your symptoms or reason for visit..."
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="btn-primary-large submit-booking"
            disabled={!selectedDate || !selectedSlot}
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
