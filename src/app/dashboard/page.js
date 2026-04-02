'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, FileText, LogOut, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import '../admin/dashboard/admin.css';
import './dashboard.css';

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    const saved = localStorage.getItem('doccare_user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);
    setUser(u);

    fetch(`/api/appointments?patientId=${u.id}`)
      .then(r => r.json())
      .then(data => { setAppointments(data.appointments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('doccare_user');
    router.push('/login');
  };

  const statusClass = (s) => s === 'completed' ? 'success' : s === 'cancelled' ? 'danger' : 'pending';

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="dash-logo">
          <h3>DocCare</h3>
          <span className="badge">Patient</span>
        </div>
        <div className="dash-user">
          <div className="dash-avatar"><User size={28} /></div>
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.email}</p>
          </div>
        </div>
        <nav className="dash-nav">
          <button className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            <CalendarDays size={20} /> My Appointments
          </button>
          <button className={`nav-item ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>
            <FileText size={20} /> My Records
          </button>
        </nav>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dash-header">
          <h2>Welcome back, <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0]}</span></h2>
          <Link href="/doctors" className="btn-primary">+ Book New Appointment</Link>
        </div>

        {activeTab === 'appointments' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="dash-section">
              <h3>My Appointments</h3>
              {loading ? (
                <p className="empty-state">Loading...</p>
              ) : appointments.length === 0 ? (
                <div className="empty-state">
                  <CalendarDays size={48} color="var(--primary-light)" />
                  <p>No appointments yet.</p>
                  <Link href="/doctors" className="btn-primary" style={{ marginTop: '1rem' }}>Book Your First Slot</Link>
                </div>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Date</th><th>Time Slot</th><th>Doctor</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt._id}>
                        <td>{new Date(apt.date).toLocaleDateString()}</td>
                        <td><Clock size={14} style={{ marginRight: 6 }} />{apt.slot}</td>
                        <td>{apt.doctorId?.name || 'N/A'}</td>
                        <td>{apt.reason}</td>
                        <td><span className={`status-badge ${statusClass(apt.status)}`}>{apt.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'records' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="dash-section">
              <h3>My Medical Records</h3>
              {appointments.filter(a => a.notes || a.prescriptionUrl).length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} color="var(--primary-light)" />
                  <p>No records yet. Records are added by your doctor after consultation.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Date</th><th>Doctor</th><th>Notes</th><th>Prescription</th></tr></thead>
                  <tbody>
                    {appointments.filter(a => a.notes || a.prescriptionUrl).map(apt => (
                      <tr key={apt._id}>
                        <td>{new Date(apt.date).toLocaleDateString()}</td>
                        <td>{apt.doctorId?.name}</td>
                        <td>{apt.notes || '-'}</td>
                        <td>{apt.prescriptionUrl ? <a href={apt.prescriptionUrl} className="link-primary">View</a> : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
