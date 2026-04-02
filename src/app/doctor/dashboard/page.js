'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, LogOut, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import '../../admin/dashboard/admin.css';
import '../../dashboard/dashboard.css';

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('doccare_user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);

    fetch(`/api/appointments?doctorId=${u.id}`)
      .then(r => r.json())
      .then(data => { setAppointments(data.appointments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
  };

  const handleLogout = () => {
    localStorage.removeItem('doccare_user');
    router.push('/login');
  };

  const today = appointments.filter(a => {
    const d = new Date(a.date);
    const n = new Date();
    return d.toDateString() === n.toDateString();
  });

  const upcoming = appointments.filter(a => new Date(a.date) > new Date());

  const statusClass = (s) => s === 'completed' ? 'success' : s === 'cancelled' ? 'danger' : 'pending';

  return (
    <div className="doctor-dash-container">
      <aside className="doctor-sidebar">
        <div className="dash-logo">
          <h3>DocCare</h3>
          <span className="badge">Doctor</span>
        </div>
        <div className="dash-user">
          <div className="dash-avatar"><User size={28} /></div>
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="sidebar-stats">
          <div className="side-stat">
            <strong>{today.length}</strong>
            <span>Today</span>
          </div>
          <div className="side-stat">
            <strong>{upcoming.length}</strong>
            <span>Upcoming</span>
          </div>
          <div className="side-stat">
            <strong>{appointments.filter(a => a.status === 'completed').length}</strong>
            <span>Completed</span>
          </div>
        </div>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      <main className="doctor-main">
        <div className="dash-header">
          <h2>Schedule — <span style={{ color: 'var(--primary)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span></h2>
        </div>

        <motion.div className="admin-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)', fontWeight: 700, fontSize: '1.3rem' }}>
            All Appointments
          </h3>
          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading schedule...</p>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <CalendarDays size={48} color="var(--primary-light)" />
              <p>No appointments booked yet.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead><tr><th>Date</th><th>Time (30m)</th><th>Patient</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map(apt => (
                  <tr key={apt._id}>
                    <td>{new Date(apt.date).toLocaleDateString()}</td>
                    <td><Clock size={14} style={{ marginRight: 6 }} />{apt.slot}</td>
                    <td>{apt.patientId?.name || 'N/A'}</td>
                    <td>{apt.reason}</td>
                    <td><span className={`status-badge ${statusClass(apt.status)}`}>{apt.status}</span></td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      {apt.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(apt._id, 'completed')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#059669' }}>
                            <CheckCircle size={20} />
                          </button>
                          <button onClick={() => updateStatus(apt._id, 'cancelled')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626' }}>
                            <XCircle size={20} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>
      </main>
    </div>
  );
}
