'use client';
import { useState, useEffect, useCallback } from 'react';
import { Users, Calendar as CalendarIcon, FileStack, Settings, Search, Plus, Activity, LogOut, ScanLine, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { BlurText } from '../../../components/ReactBits/BlurText';
import { Magnetic } from '../../../components/ReactBits/Magnetic';
import './admin.css';

const QRScanner = dynamic(() => import('../../../components/QRScanner'), { ssr: false });

/* ─── Reusable Modal Shell ─── */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-card"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

/* ─── Add Appointment Modal ─── */
function AddAppointmentModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ patientEmail: '', doctorEmail: '', date: '', slot: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
    '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  ];

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      // Resolve patient & doctor IDs by email
      const [pRes, dRes] = await Promise.all([
        fetch(`/api/admin/directory?email=${encodeURIComponent(form.patientEmail)}`),
        fetch(`/api/admin/directory?email=${encodeURIComponent(form.doctorEmail)}`)
      ]);
      const pData = await pRes.json();
      const dData = await dRes.json();
      const patient = pData.users?.[0];
      const doctor = dData.users?.[0];
      if (!patient) { setError('Patient email not found.'); setLoading(false); return; }
      if (!doctor) { setError('Doctor email not found.'); setLoading(false); return; }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient._id, doctorId: doctor._id, date: form.date, slot: form.slot, reason: form.reason })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to book.'); } else { onSuccess(); }
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  return (
    <Modal title="➕ New Appointment" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && <p className="modal-error">{error}</p>}
        <div className="form-group">
          <label>Patient Email</label>
          <input type="email" required placeholder="patient@example.com" value={form.patientEmail} onChange={e => setForm(f => ({ ...f, patientEmail: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Doctor Email</label>
          <input type="email" required placeholder="doctor@clinic.com" value={form.doctorEmail} onChange={e => setForm(f => ({ ...f, doctorEmail: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Time Slot</label>
            <select required value={form.slot} onChange={e => setForm(f => ({ ...f, slot: e.target.value }))}>
              <option value="">Select slot</option>
              {SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Reason for Visit</label>
          <textarea required placeholder="Describe the reason…" rows={3} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Booking…' : 'Book Appointment'}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Add User / Doctor Modal ─── */
function AddUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'patient', specialty: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { name: form.name, email: form.email, password: form.password, phone: form.phone, role: form.role };
      if (form.role === 'doctor' && form.specialty) payload.specialty = form.specialty;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-bypass': 'doccare-admin-internal-2026',
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create user.'); } else { onSuccess(); }
    } catch { setError('Network error. Please try again.'); }
    setLoading(false);
  };

  return (
    <Modal title="➕ Add New User" onClose={onClose}>
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && <p className="modal-error">{error}</p>}
        <div className="form-row">
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" required placeholder="Dr. John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" required placeholder="user@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>
        {form.role === 'doctor' && (
          <div className="form-group">
            <label>Specialty</label>
            <input type="text" placeholder="e.g. Cardiologist" value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} />
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating…' : 'Create User'}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Success Toast ─── */
function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      className="admin-toast"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
    >
      <CheckCircle size={20} color="#10b981" /> {message}
    </motion.div>
  );
}

/* ─── Main Admin Dashboard ─── */
export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('schedule');
  const [stats, setStats] = useState({ doctorCount: 0, patientCount: 0, todayCount: 0 });
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError]   = useState(null);
  const [scanKey, setScanKey]       = useState(0);
  const [showModal, setShowModal]   = useState(false);
  const [toast, setToast]           = useState('');

  const handleScanSuccess = useCallback(async (decodedText, decodedResult, resumeScan) => {
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
  }, []);

  const handleScanError = useCallback(() => {}, []);

  const fetchData = useCallback(() => {
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

  useEffect(() => {
    const saved = localStorage.getItem('doccare_user');
    if (!saved) { router.push('/login'); return; }
    fetchData();
  }, [fetchData, router]);

  const handleLogout = () => { localStorage.removeItem('doccare_user'); router.push('/login'); };
  const statusClass = (s) => s === 'completed' ? 'success' : s === 'cancelled' ? 'danger' : 'pending';
  const roleColor = (r) => r === 'doctor' ? { background: '#EFF6FF', color: 'var(--primary)' } : r === 'admin' ? { background: '#FEE2E2', color: '#DC2626' } : { background: '#FEF3C7', color: '#D97706' };

  /* Which modal label to show for "New Entry" */
  const newEntryLabel = () => {
    if (activeTab === 'schedule') return 'New Appointment';
    if (activeTab === 'directory') return 'Add User';
    return 'New Entry';
  };

  /* Hide button on tabs where it makes no sense */
  const showNewEntry = ['schedule', 'directory'].includes(activeTab);

  const handleEntrySuccess = (msg) => {
    setShowModal(false);
    setToast(msg);
    fetchData(); // refresh data
  };

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
            {showNewEntry && (
              <Magnetic>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                  <Plus size={18} /> {newEntryLabel()}
                </button>
              </Magnetic>
            )}
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
                <div className="section-header">
                  <h3><BlurText text="Medical Records Vault" delay={0.1} /></h3>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {appointments.filter(a => a.status === 'completed').length} completed
                      &nbsp;·&nbsp;
                      {appointments.filter(a => a.status === 'pending').length} pending
                    </span>
                  </div>
                </div>

                {/* Completed Records */}
                {appointments.filter(a => a.status !== 'cancelled').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <FileStack size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.5rem' }}>No records yet</p>
                    <p style={{ fontSize: '0.9rem' }}>Records appear here once doctors complete consultations from the Doctor Dashboard.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {appointments
                      .filter(a => a.status !== 'cancelled')
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(apt => (
                        <div key={apt._id} className="vault-record-card">
                          <div className="vault-record-left">
                            <div className="vault-record-avatar">
                              {(apt.patientId?.name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{apt.patientId?.name || 'Unknown Patient'}</strong>
                              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                Dr. {apt.doctorId?.name || 'N/A'} &nbsp;·&nbsp; {new Date(apt.date).toLocaleDateString()} &nbsp;·&nbsp; {apt.slot}
                              </p>
                              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
                                <strong>Reason:</strong> {apt.reason}
                              </p>
                            </div>
                          </div>

                          <div className="vault-record-details">
                            {apt.notes && (
                              <div className="vault-record-detail">
                                <span className="vault-detail-label">📋 Notes</span>
                                <span className="vault-detail-value">{apt.notes}</span>
                              </div>
                            )}
                            {apt.prescriptionUrl && (
                              <div className="vault-record-detail">
                                <span className="vault-detail-label">💊 Prescription</span>
                                <span className="vault-detail-value">{apt.prescriptionUrl}</span>
                              </div>
                            )}
                            {apt.reportUrl && (
                              <div className="vault-record-detail">
                                <span className="vault-detail-label">🔗 Report</span>
                                <a href={apt.reportUrl} target="_blank" rel="noopener noreferrer" className="vault-detail-link">{apt.reportUrl}</a>
                              </div>
                            )}
                            {!apt.notes && !apt.prescriptionUrl && !apt.reportUrl && (
                              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>No clinical notes added yet</span>
                            )}
                          </div>

                          <div className="vault-record-right">
                            <span className={`status-badge ${statusClass(apt.status)}`}>{apt.status}</span>
                            {apt.status === 'pending' && (
                              <button
                                className="vault-complete-btn"
                                onClick={async () => {
                                  const res = await fetch(`/api/appointments/${apt._id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: 'completed' })
                                  });
                                  if (res.ok) {
                                    setToast('Marked as completed!');
                                    fetchData();
                                  }
                                }}
                              >
                                ✅ Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                )}
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
                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 300 }}>
                    {(scanResult || scanError) && (
                      <div style={{ textAlign: 'center', padding: '2rem', background: scanResult ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 15, border: `1px solid ${scanResult ? '#10b981' : '#ef4444'}`, marginBottom: '1.5rem' }}>
                        {scanResult ? (
                          <>
                            <CheckCircle size={56} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                            <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>✅ Ticket Verified!</h2>
                            <div style={{ background: 'white', padding: '1.25rem', borderRadius: 10, textAlign: 'left', marginBottom: '1.5rem' }}>
                              <p><strong>Patient:</strong> {scanResult.patient?.name}</p>
                              <p><strong>Doctor:</strong> Dr. {scanResult.doctor?.name}</p>
                              <p><strong>Date:</strong> {new Date(scanResult.date).toLocaleDateString()}</p>
                              <p><strong>Slot:</strong> {scanResult.slot}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={56} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                            <h2 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Scan Failed</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{scanError}</p>
                          </>
                        )}
                        <button className="btn-primary" onClick={() => { setScanResult(null); setScanError(null); setScanKey(k => k + 1); }}>
                          🔄 Scan Next Ticket
                        </button>
                      </div>
                    )}
                    {!scanResult && !scanError && (
                      <QRScanner key={scanKey} onScanSuccess={handleScanSuccess} onScanError={handleScanError} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 240, padding: '2rem', background: '#f8fafc', borderRadius: 15 }}>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ScanLine /> How to Scan</h3>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
                      {[
                        ['🎥', 'Click "Open Camera" and allow camera access when the browser prompts.'],
                        ['📱', "Hold the patient's phone/ticket QR code up to the webcam."],
                        ['🔆', 'Avoid glare — tilt the screen slightly if the scan fails.'],
                        ['✅', 'Green checkmark appears instantly on a valid ticket.'],
                        ['⌨️', 'No camera? Use the "Enter token manually" link below the scanner.'],
                      ].map(([icon, text], i) => (
                        <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.88rem' }}>
                          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{icon}</span>
                          <span>{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─── Modals ─── */}
      <AnimatePresence>
        {showModal && activeTab === 'schedule' && (
          <AddAppointmentModal
            onClose={() => setShowModal(false)}
            onSuccess={() => handleEntrySuccess('Appointment booked successfully!')}
          />
        )}
        {showModal && activeTab === 'directory' && (
          <AddUserModal
            onClose={() => setShowModal(false)}
            onSuccess={() => handleEntrySuccess('User created successfully!')}
          />
        )}
      </AnimatePresence>

      {/* ─── Toast ─── */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast('')} />}
      </AnimatePresence>
    </div>
  );
}
