'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, LogOut, Clock, User, CheckCircle, XCircle,
  FileText, X, Save, FlaskConical, Stethoscope, ImageIcon,
  Pill, ChevronRight, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './doctor.css';

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser]                 = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState('today');

  // Drawer state
  const [selected, setSelected]         = useState(null);
  const [drawerOpen, setDrawerOpen]     = useState(false);
  const [form, setForm]                 = useState({ notes: '', prescriptionUrl: '', reportUrl: '', status: '' });
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  const fetchData = useCallback((u) => {
    fetch(`/api/appointments?doctorId=${u.id}`)
      .then(r => r.json())
      .then(data => { setAppointments(data.appointments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('doccare_user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);

    // Role Guard
    if (u.role !== 'doctor') {
      router.push(u.role === 'admin' ? '/admin/dashboard' : '/dashboard');
      return;
    }

    setUser(u);
    fetchData(u);
  }, [router, fetchData]);

  const openDrawer = (apt) => {
    setSelected(apt);
    setForm({
      notes: apt.notes || '',
      prescriptionUrl: apt.prescriptionUrl || '',
      reportUrl: apt.reportUrl || '',
      status: apt.status,
    });
    setSaved(false);
    setDrawerOpen(true);
  };

  const closeDrawer = () => { setDrawerOpen(false); setSelected(null); };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/appointments/${selected._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: form.notes,
          prescriptionUrl: form.prescriptionUrl,
          reportUrl: form.reportUrl,
          status: form.status,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(prev => prev.map(a => a._id === selected._id ? data.appointment : a));
        setSelected(data.appointment);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { localStorage.removeItem('doccare_user'); router.push('/login'); };

  const today    = appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString());
  const upcoming = appointments.filter(a => {
    const d = new Date(a.date);
    const now = new Date();
    // Truly upcoming: future dates only
    return d > now && d.toDateString() !== now.toDateString();
  });
  const completed = appointments.filter(a => a.status === 'completed');
  const checkedIn = appointments.filter(a => a.isPresent);

  const displayList = activeTab === 'today' ? today
    : activeTab === 'checkedin' ? checkedIn
    : activeTab === 'upcoming' ? upcoming
    : completed;

  const statusClass = (s) => s === 'completed' ? 'success' : s === 'cancelled' ? 'danger' : 'pending';
  const initials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="doctor-dash-container">
      {/* ─── Sidebar ─── */}
      <aside className="doctor-sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={28} color="#60a5fa" />
          <div>
            <h3 style={{ color: 'white', fontSize: '1.2rem', fontWeight: 800 }}>DocCare</h3>
            <span style={{ background: '#2563eb', color: 'white', fontSize: '0.7rem', padding: '0.15rem 0.6rem', borderRadius: 20, fontWeight: 700 }}>Doctor</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.08)', padding: '0.75rem 1rem', borderRadius: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>
            {initials(user?.name)}
          </div>
          <div>
            <strong style={{ color: 'white', fontSize: '0.9rem', display: 'block' }}>{user?.name}</strong>
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.75rem' }}>{user?.email}</span>
          </div>
        </div>

        <div className="doctor-stat-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { label: "Today",      value: today.length,     tab: 'today',     icon: <CalendarDays size={16}/> },
            { label: "Checked In", value: checkedIn.length, tab: 'checkedin', icon: <CheckCircle size={16}/> },
            { label: "Upcoming",   value: upcoming.length,  tab: 'upcoming',  icon: <Clock size={16}/> },
            { label: "Completed",  value: completed.length, tab: 'completed', icon: <FileText size={16}/> },
          ].map(item => (
            <button key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              style={{
                background: activeTab === item.tab ? 'rgba(37,99,235,0.35)' : 'rgba(255,255,255,0.06)',
                border: activeTab === item.tab ? '1px solid rgba(96,165,250,0.5)' : '1px solid transparent',
                borderRadius: 10, padding: '0.7rem 1rem', cursor: 'pointer', width: '100%',
                display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', fontSize: '0.88rem',
                fontWeight: 600, transition: 'all 0.2s',
              }}>
              <span style={{ color: '#60a5fa' }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.1rem 0.5rem', borderRadius: 20, fontSize: '0.78rem' }}>{item.value}</span>
            </button>
          ))}
        </div>

        <button className="nav-item logout-btn" onClick={handleLogout} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.75rem 1rem', borderRadius: 10, color: '#fca5a5', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', width: '100%' }}>
          <LogOut size={18} /> Log Out
        </button>
      </aside>

      {/* ─── Main ─── */}
      <main className="doctor-main">
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            {activeTab === 'today' ? "Today's Patients"
              : activeTab === 'checkedin' ? '✅ Checked-In Patients'
              : activeTab === 'upcoming' ? 'Upcoming Schedule'
              : '📋 Completed Consultations'}
          </h2>
          <p style={{ color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem' }}>Loading patients...</p>
        ) : displayList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>
            <CalendarDays size={52} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No patients here</p>
          </div>
        ) : (
          <AnimatePresence>
            {displayList.map((apt, i) => (
              <motion.div key={apt._id}
                className={`patient-card ${apt.isPresent ? 'isPresent' : ''}`}
                onClick={() => openDrawer(apt)}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <div className="patient-avatar">{initials(apt.patientId?.name)}</div>
                <div className="patient-info">
                  <h4>{apt.patientId?.name || 'Unknown Patient'}</h4>
                  <p><Clock size={12} style={{ marginRight: 4 }} />{apt.slot} &nbsp;·&nbsp; {apt.reason}</p>
                </div>
                <div className="patient-meta">
                  <span className={`status-badge ${statusClass(apt.status)}`} style={{ fontSize: '0.72rem', padding: '0.2rem 0.7rem' }}>{apt.status}</span>
                  {apt.isPresent && <span className="present-badge">Checked In</span>}
                  {apt.notes && <span style={{ fontSize: '0.72rem', color: '#2563eb' }}>📋 Has Notes</span>}
                </div>
                <ChevronRight size={20} color="#94a3b8" style={{ marginLeft: '0.5rem' }} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </main>

      {/* ─── Consultation Drawer ─── */}
      <AnimatePresence>
        {drawerOpen && selected && (
          <>
            <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeDrawer} />
            <motion.div className="consultation-drawer"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}>

              {/* Header */}
              <div className="drawer-header">
                <div>
                  <h3>👤 {selected.patientId?.name}</h3>
                  <p>{selected.slot} &nbsp;·&nbsp; {new Date(selected.date).toLocaleDateString()}</p>
                </div>
                <button className="drawer-close" onClick={closeDrawer}><X size={16} /></button>
              </div>

              <div className="drawer-body">

                {/* Patient Info Strip */}
                <div className="patient-info-strip">
                  {[
                    { label: 'Phone',   value: selected.patientId?.phone || 'N/A' },
                    { label: 'Email',   value: selected.patientId?.email || 'N/A' },
                    { label: 'Reason',  value: selected.reason },
                    { label: 'Check-In',value: selected.isPresent ? '✅ Present' : '⏳ Not yet' },
                  ].map(item => (
                    <div key={item.label} className="info-item">
                      <label>{item.label}</label>
                      <span>{item.value}</span>
                    </div>
                  ))}
                  {selected.patientId?.medicalHistory && (
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <label>Medical History</label>
                      <span>{selected.patientId.medicalHistory}</span>
                    </div>
                  )}
                </div>

                {/* ── Status ── */}
                <div className="report-section">
                  <div className="report-section-title"><Stethoscope size={15} /> Consultation Status</div>
                  <div className="status-toggle-row">
                    {['completed','pending','cancelled'].map(s => (
                      <button key={s}
                        className={`status-toggle-btn ${s === 'cancelled' ? 'cancel' : 'complete'} ${form.status === s ? 'active' : ''}`}
                        onClick={() => setForm(f => ({ ...f, status: s }))}>
                        {s === 'completed' ? <CheckCircle size={15}/> : s === 'cancelled' ? <XCircle size={15}/> : <Clock size={15}/>}
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Clinical Notes ── */}
                <div className="report-section">
                  <div className="report-section-title"><FileText size={15} /> Clinical Notes / Diagnosis</div>
                  <textarea
                    className="report-textarea"
                    placeholder="Enter diagnosis, observations, symptoms, treatment plan..."
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={4}
                  />
                </div>

                {/* ── Prescription ── */}
                <div className="report-section">
                  <div className="report-section-title"><Pill size={15} /> Prescription</div>
                  <textarea
                    className="report-textarea"
                    placeholder="e.g. Amoxicillin 500mg — 1 tablet twice daily for 7 days&#10;Paracetamol 650mg — as needed for fever"
                    value={form.prescriptionUrl}
                    onChange={e => setForm(f => ({ ...f, prescriptionUrl: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* ── Reports / X-Ray ── */}
                <div className="report-section">
                  <div className="report-section-title"><ImageIcon size={15} /> X-Ray / Lab Report Link</div>
                  <input
                    type="url"
                    className="report-input"
                    placeholder="https://drive.google.com/... or any report URL"
                    value={form.reportUrl}
                    onChange={e => setForm(f => ({ ...f, reportUrl: e.target.value }))}
                  />
                  {form.reportUrl && (
                    <div className="url-preview">
                      🔗 <a href={form.reportUrl} target="_blank" rel="noopener noreferrer">{form.reportUrl}</a>
                    </div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="drawer-footer">
                <button className="drawer-cancel-btn" onClick={closeDrawer}>Close</button>
                {saved ? (
                  <div className="save-success"><CheckCircle size={18}/> Saved successfully!</div>
                ) : (
                  <button className="drawer-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : <><Save size={16}/> Save Report</>}
                  </button>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
