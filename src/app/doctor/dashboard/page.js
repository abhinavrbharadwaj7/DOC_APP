'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays, LogOut, Clock, User, CheckCircle, XCircle,
  FileText, X, Save, FlaskConical, Stethoscope, ImageIcon,
  Pill, ChevronRight, Activity, Settings, Camera, Edit3, BellRing
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
  const [drawerTab, setDrawerTab]       = useState('notes'); // 'info', 'notes', 'prescriptions', 'reports'
  const [form, setForm]                 = useState({ notes: '', prescriptionUrl: '', reportUrl: '', status: '' });
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [uploading, setUploading]       = useState(false);
  const [callingAdmin, setCallingAdmin] = useState(false);

  // Profile Settings state
  const [profileForm, setProfileForm]   = useState({ name: '', phone: '', specialty: '', profilePic: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

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
    setProfileForm({
      name: u.name || '',
      phone: u.phone || '',
      specialty: u.specialty || '',
      profilePic: u.profilePic || '',
    });
    fetchData(u);
  }, [router, fetchData]);

  const openDrawer = (apt) => {
    setSelected(apt);
    setDrawerTab('info');
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setForm(f => ({ ...f, reportUrl: data.url }));
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

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

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.success) {
        setProfileForm(f => ({ ...f, profilePic: data.url }));
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      
      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user;
        setUser(updatedUser);
        // Update local storage
        localStorage.setItem('doccare_user', JSON.stringify(updatedUser));
        
        // Refresh appointment data to ensure any populated fields are fresh
        fetchData(updatedUser);
        
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      } else {
        alert('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCallNextPatient = async () => {
    setCallingAdmin(true);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: user.id,
          doctorName: user.name,
          message: `Dr. ${user.name.split(' ')[0]} is ready for the next patient.`
        })
      });
      // Show short feedback
      setTimeout(() => setCallingAdmin(false), 2000);
    } catch(err) {
      console.error(err);
      setCallingAdmin(false);
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
            <h3 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800 }}>DocCare</h3>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Doctor Portal</span>
          </div>
        </div>

        <div className="doctor-profile-card" onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer' }}>
          {user?.profilePic ? (
            <img src={user.profilePic} alt="Profile" className="patient-avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="patient-avatar">{initials(user?.name)}</div>
          )}
          <div>
            <strong>Dr. {user?.name?.split(' ')[0]}</strong>
            <p style={{ fontSize: '0.7rem', color: '#60a5fa', margin: '0' }}>{user?.specialty || 'General Practice'}</p>
            <span>{user?.email}</span>
          </div>
        </div>

        <nav className="doctor-nav-menu">
          {[
            { label: "Today's Queue", value: today.length,     tab: 'today',     icon: <CalendarDays size={18}/> },
            { label: "Checked In",    value: checkedIn.length, tab: 'checkedin', icon: <CheckCircle size={18}/> },
            { label: "Upcoming",      value: upcoming.length,  tab: 'upcoming',  icon: <Clock size={18}/> },
            { label: "Completed",     value: completed.length, tab: 'completed', icon: <FileText size={18}/> },
            { label: "Profile Settings", value: 0,             tab: 'settings',  icon: <Settings size={18}/> },
          ].map(item => (
            <button key={item.tab}
              className={`nav-btn ${activeTab === item.tab ? 'active' : ''}`}
              onClick={() => setActiveTab(item.tab)}>
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
              {item.value > 0 && <span className="badge">{item.value}</span>}
            </button>
          ))}
        </nav>

        <button className="nav-btn logout" onClick={handleLogout}>
          <LogOut size={18} /> Log Out
        </button>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="doctor-main">
        
        {/* NEW: Dashboard Top Area */}
        <header className="dashboard-header">
          <div>
            <h2>
              {activeTab === 'today' ? "Today's Consultations"
                : activeTab === 'checkedin' ? 'Patients Waiting'
                : activeTab === 'upcoming' ? 'Upcoming Schedule'
                : activeTab === 'settings' ? 'Profile Settings'
                : 'Completed Consultations'}
            </h2>
            <p className="date-subtitle">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleCallNextPatient}
            disabled={callingAdmin}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
          >
            {callingAdmin ? <CheckCircle size={18} /> : <BellRing size={18} />}
            {callingAdmin ? 'Admin Notified' : 'Call Next Patient'}
          </button>
        </header>

        {activeTab === 'today' && (
          <div className="main-stats-row">
            <div className="main-stat-card">
              <CalendarDays size={24} color="#3b82f6" />
              <div>
                <h3>{today.length}</h3>
                <p>Total Appointments</p>
              </div>
            </div>
            <div className="main-stat-card highlight">
              <CheckCircle size={24} color="#10b981" />
              <div>
                <h3>{checkedIn.length}</h3>
                <p>Waiting in Clinic</p>
              </div>
            </div>
            <div className="main-stat-card">
              <FileText size={24} color="#6366f1" />
              <div>
                <h3>{completed.length}</h3>
                <p>Completed</p>
              </div>
            </div>
          </div>
        )}

        <div className="patient-list-container">
          {activeTab === 'settings' ? (
            <div className="settings-container fade-in">
              <div className="settings-card">
                <div className="settings-header">
                  <h3><User size={20} /> Personal Information</h3>
                  <p>Update your photo and personal details.</p>
                </div>
                
                <div className="settings-body">
                  <div className="profile-pic-section">
                    <div className="pic-preview">
                      {profileForm.profilePic ? (
                         <img src={profileForm.profilePic} alt="Profile" className="preview-img" />
                      ) : (
                         <div className="preview-placeholder">{initials(profileForm.name || 'Doc')}</div>
                      )}
                      
                      <div className="upload-btn-wrapper">
                        <button className="upload-btn"><Camera size={16}/> {uploading ? 'Uploading...' : 'Change Photo'}</button>
                        <input type="file" accept="image/*" onChange={handleProfileUpload} disabled={uploading} />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid">
                     <div className="form-group">
                       <label>Full Name</label>
                       <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="report-input" />
                     </div>
                     <div className="form-group">
                       <label>Phone Number</label>
                       <input type="text" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="report-input" placeholder="e.g. +1 234 567 8900" />
                     </div>
                     <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                       <label>Medical Specialty</label>
                       <input type="text" value={profileForm.specialty} onChange={e => setProfileForm({...profileForm, specialty: e.target.value})} className="report-input" placeholder="e.g. Cardiologist, General Physician" />
                     </div>
                  </div>
                </div>

                <div className="settings-footer">
                   {profileSaved ? (
                     <div className="save-success"><CheckCircle size={18}/> Profile Saved!</div>
                   ) : (
                     <button className="drawer-save-btn" onClick={handleSaveProfile} disabled={savingProfile || uploading}>
                       {savingProfile ? 'Saving...' : <><Save size={16}/> Save Changes</>}
                     </button>
                   )}
                </div>
              </div>
            </div>
          ) : (
            loading ? (
              <div className="loading-state">Loading actuals...</div>
            ) : displayList.length === 0 ? (
              <div className="premium-empty-state">
                <div className="empty-icon-wrapper">
                  <CalendarDays size={48} strokeWidth={1.5} />
                </div>
                <h3>Your schedule is clear</h3>
                <p>When patients book or check in, their consultation cards will appear here. Enjoy your break!</p>
              </div>
            ) : (
              <div className="patient-cards-grid">
                <AnimatePresence>
                  {displayList.map((apt, i) => (
                    <motion.div key={apt._id}
                      className={`clinical-ticket ${apt.isPresent && apt.status !== 'completed' ? 'ready' : ''}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}>
                      
                      <div className="ticket-header">
                        <div className="pat-basic">
                          <div className="avatar-small">{initials(apt.patientId?.name)}</div>
                          <div>
                            <h4>{apt.patientId?.name || 'Patient'}</h4>
                            <span className="time"><Clock size={12}/> {apt.slot}</span>
                          </div>
                        </div>
                        <div className="pat-status">
                          <span className={`pill ${statusClass(apt.status)}`}>{apt.status}</span>
                          {apt.isPresent && apt.status !== 'completed' && <span className="pill green-glow">Waiting</span>}
                        </div>
                      </div>
                      
                      <div className="ticket-body">
                        <p><strong>Reason:</strong> {apt.reason}</p>
                        {apt.notes && <p className="notes-preview">📋 Notes added</p>}
                      </div>

                      <button className="start-consult-btn" onClick={() => openDrawer(apt)}>
                        {apt.status === 'completed' ? 'View Record' : 'Open Consultation'} <ChevronRight size={16}/>
                      </button>
                      
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          )}
        </div>
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
                
                {/* Custom Tab Navigation inside Drawer */}
                <div className="drawer-tabs">
                  {['info', 'notes', 'prescriptions'].map(tab => (
                    <button key={tab} 
                      className={`tab-btn ${drawerTab === tab ? 'active' : ''}`}
                      onClick={() => setDrawerTab(tab)}>
                      {tab === 'info' && <User size={14}/>}
                      {tab === 'notes' && <FileText size={14}/>}
                      {tab === 'prescriptions' && <Pill size={14}/>}
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="tab-content">
                  {/* TAB: INFO */}
                  {drawerTab === 'info' && (
                    <div className="fade-in">
                      <div className="patient-info-strip">
                        <div className="info-item">
                          <label>Phone</label>
                          <span>{selected.patientId?.phone || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <label>Email</label>
                          <span>{selected.patientId?.email || 'N/A'}</span>
                        </div>
                        <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                          <label>Consultation Reason</label>
                          <span>{selected.reason}</span>
                        </div>
                        {selected.patientId?.medicalHistory && (
                          <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                            <label>Past Medical History</label>
                            <span style={{ color: '#dc2626' }}>{selected.patientId.medicalHistory}</span>
                          </div>
                        )}
                      </div>

                      <div className="report-section" style={{ marginTop: '1.5rem' }}>
                        <div className="report-section-title"><Stethoscope size={15} /> Change Status</div>
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
                        <p className="tab-hint">Status changes will be saved when you click 'Save Report' below.</p>
                      </div>
                    </div>
                  )}

                  {/* TAB: NOTES */}
                  {drawerTab === 'notes' && (
                    <div className="fade-in">
                      <div className="report-section">
                        <div className="report-section-title"><FileText size={15} /> Clinical Notes</div>
                        <p className="tab-hint">Enter your diagnosis, physical examination findings, and internal notes here.</p>
                        <textarea
                          className="report-textarea"
                          placeholder="e.g., Patient presented with mild fever (99°F)..."
                          value={form.notes}
                          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                          rows={8}
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB: PRESCRIPTIONS & REPORTS */}
                  {drawerTab === 'prescriptions' && (
                    <div className="fade-in">
                      <div className="report-section">
                        <div className="report-section-title"><Pill size={15} /> Medications</div>
                        <p className="tab-hint">Write the prescription list clearly for the patient to view in their portal.</p>
                        <textarea
                          className="report-textarea"
                          placeholder="e.g., Amoxicillin 500mg, twice a day for 5 days"
                          value={form.prescriptionUrl}
                          onChange={e => setForm(f => ({ ...f, prescriptionUrl: e.target.value }))}
                          rows={4}
                        />
                      </div>
                      
                      <div className="report-section" style={{ marginTop: '1.5rem' }}>
                        <div className="report-section-title"><ImageIcon size={15} /> Attach Lab/X-Ray Report (File)</div>
                        <p className="tab-hint">Upload a local file directly instead of entering a URL.</p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="report-input-file"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          style={{ marginBottom: '10px' }}
                        />
                        {uploading && <div className="loading-state" style={{ padding: '0', fontSize: '0.9rem', marginBottom: '10px' }}>Uploading...</div>}
                        {form.reportUrl && !uploading && (
                          <div className="url-preview">
                            ✅ <strong>Attached:</strong> <a href={form.reportUrl} target="_blank" rel="noopener noreferrer">View File</a>
                          </div>
                        )}
                      </div>
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
                  <button className="drawer-save-btn" onClick={handleSave} disabled={saving || uploading}>
                    {saving ? 'Saving...' : uploading ? 'Uploading...' : <><Save size={16}/> Save Report</>}
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
