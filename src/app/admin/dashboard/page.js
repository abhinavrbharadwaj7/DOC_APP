'use client';
import { useState, useEffect } from 'react';
import { Users, Calendar as CalendarIcon, FileStack, Settings, Search, Plus, Activity, LogOut, ScanLine, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { BlurText } from '../../../components/ReactBits/BlurText';
import { Magnetic } from '../../../components/ReactBits/Magnetic';
import QRScanner from '../../../components/QRScanner';
import './admin.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('schedule');
  const [stats, setStats] = useState({ doctorCount: 0, patientCount: 0, todayCount: 0 });
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [resumeScanner, setResumeScanner] = useState(null);

  const handleScanSuccess = async (decodedText, decodedResult, resumeScan) => {
    setResumeScanner(() => resumeScan);
    try {
      const res = await fetch('/api/admin/verify-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodedText })
      });
      const data = await res.json();
      if (res.ok) {
        setScanResult(data);
        setScanError(null);
      } else {
        setScanResult(null);
        setScanError(data.error || 'Invalid Ticket');
      }
    } catch (err) {
      setScanResult(null);
      setScanError('Failed to verify ticket.');
    }
  };

  const handleScanError = () => {
    // silently ignore ongoing scan failures
  };

  useEffect(() => {
    const saved = localStorage.getItem('doccare_user');
    if (!saved) { router.push('/login'); return; }

    Promise.all([
      fetch('/api/admin/stats').then(r => r.json()),
      fetch('/api/appointments').then(r => r.json()),
      fetch('/api/admin/directory').then(r => r.json()),
    ]).then(([s, a, d]) => {
      setStats(s);
      setAppointments(a.appointments || []);
      setUsers(d.users || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.removeItem('doccare_user'); router.push('/login'); };
  const statusClass = (s) => s === 'completed' ? 'success' : s === 'cancelled' ? 'danger' : 'pending';
  const roleColor = (r) => r === 'doctor' ? { background: '#EFF6FF', color: 'var(--primary)' } : r === 'admin' ? { background: '#FEE2E2', color: '#DC2626' } : { background: '#FEF3C7', color: '#D97706' };

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h3><Activity size={28} color="var(--primary)" /> DocCare <span className="badge">Admin</span></h3>
        </div>
        <nav className="admin-nav">
          <button onClick={() => setActiveTab('schedule')} className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}><CalendarIcon size={20} /> Master Schedule</button>
          <button onClick={() => setActiveTab('scanner')} className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`}><ScanLine size={20} /> Check-in Scanner</button>
          <button onClick={() => setActiveTab('directory')} className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`}><Users size={20} /> Directory</button>
          <button onClick={() => setActiveTab('records')} className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}><FileStack size={20} /> Records Vault</button>
          <button onClick={() => setActiveTab('settings')} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}><Settings size={20} /> System Settings</button>
        </nav>
        <button className="nav-item logout-btn" onClick={handleLogout} style={{ marginTop: 'auto' }}>
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <motion.div className="admin-search" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Search size={20} className="search-icon" />
            <input type="text" placeholder={`Search ${activeTab}...`} />
          </motion.div>
          <motion.div className="admin-actions" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Magnetic><button className="btn-primary"><Plus size={18} /> New Entry</button></Magnetic>
          </motion.div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon doctors-icon"><Users size={28} /></div>
                  <div className="stat-details">
                    <span className="stat-title">Active Doctors</span>
                    <strong className="stat-value">{loading ? '...' : stats.doctorCount}</strong>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon patients-icon"><Users size={28} /></div>
                  <div className="stat-details">
                    <span className="stat-title">Total Patients</span>
                    <strong className="stat-value">{loading ? '...' : stats.patientCount}</strong>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon apts-icon"><CalendarIcon size={28} /></div>
                  <div className="stat-details">
                    <span className="stat-title">Today's Appointments</span>
                    <strong className="stat-value">{loading ? '...' : stats.todayCount}</strong>
                  </div>
                </div>
              </div>
              <section className="admin-section">
                <div className="section-header">
                  <h3><BlurText text="All Appointments" delay={0.1} /></h3>
                </div>
                <table className="admin-table">
                  <thead><tr><th>Date</th><th>Time</th><th>Patient</th><th>Doctor</th><th>Reason</th><th>Status</th></tr></thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No appointments yet.</td></tr>
                    ) : appointments.map(apt => (
                      <tr key={apt._id}>
                        <td>{new Date(apt.date).toLocaleDateString()}</td>
                        <td>{apt.slot}</td>
                        <td>{apt.patientId?.name || 'N/A'}</td>
                        <td>{apt.doctorId?.name || 'N/A'}</td>
                        <td>{apt.reason}</td>
                        <td><span className={`status-badge ${statusClass(apt.status)}`}>{apt.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </motion.div>
          )}

          {activeTab === 'directory' && (
            <motion.div key="directory" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="admin-section">
                <div className="section-header"><h3><BlurText text="Clinic Directory" delay={0.1} /></h3></div>
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Role</th><th>Specialty</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No users yet.</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td><span className="status-badge" style={roleColor(u.role)}>{u.role}</span></td>
                        <td>{u.specialty || '-'}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || '-'}</td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </motion.div>
          )}

          {activeTab === 'records' && (
            <motion.div key="records" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="admin-section">
                <div className="section-header"><h3><BlurText text="Medical Records Vault" delay={0.1} /></h3></div>
                <table className="admin-table">
                  <thead><tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Notes</th><th>Status</th></tr></thead>
                  <tbody>
                    {appointments.filter(a => a.status === 'completed').length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No completed consultations yet.</td></tr>
                    ) : appointments.filter(a => a.status === 'completed').map(apt => (
                      <tr key={apt._id}>
                        <td>{new Date(apt.date).toLocaleDateString()}</td>
                        <td>{apt.patientId?.name || 'N/A'}</td>
                        <td>{apt.doctorId?.name || 'N/A'}</td>
                        <td>{apt.notes || 'No notes added'}</td>
                        <td><span className="status-badge success">Completed</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="admin-section" style={{ maxWidth: 800 }}>
                <div className="section-header"><h3><BlurText text="System Configuration" delay={0.1} /></h3></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                  {[
                    { title: 'SMS Notifications', desc: 'Automatically send booking confirmations & prescriptions via Twilio SMS.', status: 'Enabled', cls: 'success' },
                    { title: 'Strict 30-Min Slots', desc: 'Enforce 30 minute rigid calendar increments globally.', status: 'Enabled', cls: 'success' },
                    { title: 'Emergency Ward Status', desc: 'Redirects new bookings to critical care queue.', status: 'Disabled', cls: 'pending' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem' }}>{s.title}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{s.desc}</p>
                      </div>
                      <span className={`status-badge ${s.cls}`} style={{ padding: '0.6rem 1.2rem' }}>{s.status}</span>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'scanner' && (
            <motion.div key="scanner" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <section className="admin-section">
                <div className="section-header"><h3><BlurText text="Ticket Verification Scanner" delay={0.1} /></h3></div>
                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                  <div style={{ flex: 1 }}>
                    {(!scanResult && !scanError) ? (
                      <QRScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem', background: scanResult ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '15px', border: `1px solid ${scanResult ? '#10b981' : '#ef4444'}` }}>
                        {scanResult ? (
                          <>
                            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                            <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>Ticket Verified!</h2>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', textAlign: 'left', marginBottom: '2rem' }}>
                              <p><strong>Patient:</strong> {scanResult.patient?.name}</p>
                              <p><strong>Doctor:</strong> Dr. {scanResult.doctor?.name}</p>
                              <p><strong>Date:</strong> {new Date(scanResult.date).toLocaleDateString()}</p>
                              <p><strong>Slot:</strong> {scanResult.slot}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={64} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                            <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Scan Failed</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{scanError}</p>
                          </>
                        )}
                        <button className="btn-primary" onClick={() => { setScanResult(null); setScanError(null); if (resumeScanner) resumeScanner(); }}>Scan Next Ticket</button>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, padding: '2rem', background: '#f8fafc', borderRadius: '15px' }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ScanLine /> Scanner Instructions</h3>
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                      <li>Ensure you have granted camera permissions to the browser.</li>
                      <li>Hold the patient's phone screen with the 3D Ticket directly up to the camera.</li>
                      <li>Ensure there's no glare blocking the QR code.</li>
                      <li>A green checkmark will appear instantly once verified.</li>
                    </ul>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
