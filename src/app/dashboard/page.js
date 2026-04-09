'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, FileText, LogOut, Clock, User, QrCode, X, Settings, Camera, Save, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import Link from 'next/link';
import QRCode from 'react-qr-code';
import '../admin/dashboard/admin.css';
import './dashboard.css';
import './ticket.css';

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Profile Settings State
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', medicalHistory: '', profilePic: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 3D Tilt Effect variables
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const fetchData = (u) => {
    fetch(`/api/appointments?patientId=${u.id}`)
      .then(r => r.json())
      .then(data => { setAppointments(data.appointments || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const saved = localStorage.getItem('doccare_user');
    if (!saved) { router.push('/login'); return; }
    const u = JSON.parse(saved);

    // Role Guard
    if (u.role !== 'patient') {
      router.push(u.role === 'admin' ? '/admin/dashboard' : '/doctor/dashboard');
      return;
    }

    setUser(u);
    setProfileForm({
      name: u.name || '',
      phone: u.phone || '',
      medicalHistory: u.medicalHistory || '',
      profilePic: u.profilePic || ''
    });

    fetchData(u);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('doccare_user');
    router.push('/login');
  };

  const statusClass = (s) => s === 'completed' ? 'success' : s === 'cancelled' ? 'danger' : 'pending';

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
        
        // Refresh appointments
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

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="dash-logo">
          <h3>DocCare</h3>
          <span className="badge">Patient</span>
        </div>
        <div className="dash-user">
          <div className="dash-avatar" onClick={() => setActiveTab('settings')} style={{ cursor: 'pointer' }}>
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <User size={28} />
            )}
          </div>
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
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} /> Profile Settings
          </button>
        </nav>
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dash-header">
          <h2>
            {activeTab === 'settings' ? 'Profile Settings' : `Welcome back, `}
            {activeTab !== 'settings' && <span style={{ color: 'var(--primary)' }}>{user?.name?.split(' ')[0]}</span>}
          </h2>
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
                  <thead><tr><th>Date</th><th>Time Slot</th><th>Doctor</th><th>Reason</th><th>Status</th><th>Ticket</th></tr></thead>
                  <tbody>
                    {appointments.map(apt => (
                      <tr key={apt._id}>
                        <td>{new Date(apt.date).toLocaleDateString()}</td>
                        <td><Clock size={14} style={{ marginRight: 6 }} />{apt.slot}</td>
                        <td>{apt.doctorId?.name || 'N/A'}</td>
                        <td>{apt.reason}</td>
                        <td><span className={`status-badge ${statusClass(apt.status)}`}>{apt.status}</span></td>
                        <td>
                          {apt.entryToken && (
                            <button 
                              className="btn-primary" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              onClick={() => setSelectedTicket(apt)}
                            >
                              <QrCode size={14} style={{ marginRight: 4 }} /> View
                            </button>
                          )}
                        </td>
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
              {appointments.filter(a => a.notes || a.prescriptionUrl || a.reportUrl).length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} color="var(--primary-light)" />
                  <p>No records yet. Records are added by your doctor after consultation.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead><tr><th>Date</th><th>Doctor</th><th>Reason</th><th>Notes</th><th>Prescription</th><th>Report</th></tr></thead>
                  <tbody>
                    {appointments.filter(a => a.notes || a.prescriptionUrl || a.reportUrl).map(apt => (
                      <tr key={apt._id}>
                        <td>{new Date(apt.date).toLocaleDateString()}</td>
                        <td>{apt.doctorId?.name}</td>
                        <td>{apt.reason || '-'}</td>
                        <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>{apt.notes || '-'}</td>
                        <td style={{ maxWidth: 180, fontSize: '0.85rem' }}>
                          {apt.prescriptionUrl
                            ? apt.prescriptionUrl.startsWith('http')
                              ? <a href={apt.prescriptionUrl} target="_blank" rel="noopener noreferrer" className="link-primary">View</a>
                              : <span style={{ whiteSpace: 'pre-wrap' }}>{apt.prescriptionUrl}</span>
                            : '-'}
                        </td>
                        <td>
                          {apt.reportUrl
                            ? <a href={apt.reportUrl} target="_blank" rel="noopener noreferrer" className="link-primary">View Report</a>
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="settings-container">
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
                         <div className="preview-placeholder">
                           {profileForm.name ? profileForm.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() : 'U'}
                         </div>
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
                       <label>Past Medical History / Allergies</label>
                       <textarea 
                         value={profileForm.medicalHistory} 
                         onChange={e => setProfileForm({...profileForm, medicalHistory: e.target.value})} 
                         className="report-input" 
                         placeholder="e.g. Penicillin allergy, Asthmatic"
                         rows={4}
                         style={{ resize: 'vertical' }}
                       />
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
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {selectedTicket && (
          <motion.div 
            className="ticket-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedTicket(null)}
          >
            <div className="ticket-3d-wrapper">
              <motion.div 
                className="ticket-card"
                style={{ rotateX, rotateY }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button className="close-ticket-btn" onClick={() => setSelectedTicket(null)}>
                  <X size={16} />
                </button>

                <div className="ticket-header">
                  <h4>Entry Pass</h4>
                  <p>Admit One</p>
                </div>

                <div className="qr-container">
                  <QRCode 
                    value={selectedTicket.entryToken} 
                    size={160}
                    fgColor="#0f172a"
                    bgColor="#ffffff"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>

                <div className="ticket-details">
                  <div className="ticket-detail-row">
                    <span className="ticket-detail-label">Patient</span>
                    <span className="ticket-detail-val">{user?.name}</span>
                  </div>
                  <div className="ticket-detail-row">
                    <span className="ticket-detail-label">Date</span>
                    <span className="ticket-detail-val">{new Date(selectedTicket.date).toLocaleDateString()}</span>
                  </div>
                  <div className="ticket-detail-row">
                    <span className="ticket-detail-label">Time</span>
                    <span className="ticket-detail-val">{selectedTicket.slot.split(' - ')[0]}</span>
                  </div>
                  <div className="ticket-detail-row" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                    <span className="ticket-detail-label">Status</span>
                    <span className={`ticket-status ${selectedTicket.isPresent ? 'scanned' : 'pending'}`}>
                      {selectedTicket.isPresent ? 'Scanned' : 'Pending Entry'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
