'use client';
import { useState } from 'react';
import { Users, Calendar as CalendarIcon, FileStack, Settings, Search, Plus, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurText } from '../../../components/ReactBits/BlurText';
import { Magnetic } from '../../../components/ReactBits/Magnetic';
import './admin.css';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('schedule');

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">
           <h3><Activity className="logo-icon" size={28} color="var(--primary)"/> DocCare <span className="badge">Admin</span></h3>
        </div>
        <nav className="admin-nav">
          <button onClick={() => setActiveTab('schedule')} className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`}><CalendarIcon size={20}/> Master Schedule</button>
          <button onClick={() => setActiveTab('directory')} className={`nav-item ${activeTab === 'directory' ? 'active' : ''}`}><Users size={20}/> Directory</button>
          <button onClick={() => setActiveTab('records')} className={`nav-item ${activeTab === 'records' ? 'active' : ''}`}><FileStack size={20}/> Records Vault</button>
          <button onClick={() => setActiveTab('settings')} className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}><Settings size={20}/> System Settings</button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
           <motion.div 
             className="admin-search"
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
           >
              <Search size={20} className="search-icon" />
              <input type="text" placeholder={`Search ${activeTab}...`} />
           </motion.div>
           
           <motion.div className="admin-actions"
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
           >
              <Magnetic>
                <button className="btn-primary"><Plus size={18} /> New Entry</button>
              </Magnetic>
           </motion.div>
        </header>

        <AnimatePresence mode="wait">
           {activeTab === 'schedule' && <ScheduleView key="schedule" />}
           {activeTab === 'directory' && <DirectoryView key="directory" />}
           {activeTab === 'records' && <RecordsView key="records" />}
           {activeTab === 'settings' && <SettingsView key="settings" />}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ScheduleView() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <div className="admin-stats-grid">
           <div className="stat-card">
              <div className="stat-icon doctors-icon"><Users size={28}/></div>
              <div className="stat-details">
                 <span className="stat-title">Active Doctors</span>
                 <strong className="stat-value">5</strong>
              </div>
           </div>
           
           <div className="stat-card">
              <div className="stat-icon patients-icon"><Users size={28}/></div>
              <div className="stat-details">
                 <span className="stat-title">Total Patients</span>
                 <strong className="stat-value">1,248</strong>
              </div>
           </div>
           
           <div className="stat-card">
              <div className="stat-icon apts-icon"><CalendarIcon size={28}/></div>
              <div className="stat-details">
                 <span className="stat-title">Today's Appointments</span>
                 <strong className="stat-value">32</strong>
              </div>
           </div>
        </div>

        <section className="admin-section">
           <div className="section-header">
              <h3><BlurText text="System Master Call (Today)" delay={0.1} /></h3>
              <button className="btn-secondary btn-sm">View All</button>
           </div>
           
           <table className="admin-table">
              <thead>
                 <tr><th>Time (30m)</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Records</th></tr>
              </thead>
              <tbody>
                 <tr><td>09:00 AM</td><td>Alice Williams</td><td>Dr. Sarah Jenkins</td><td><span className="status-badge pending">Pending</span></td><td>-</td></tr>
                 <tr><td>10:00 AM</td><td>Michael Smith</td><td>Dr. Michael Chen</td><td><span className="status-badge success">Completed</span></td><td><a href="#" className="link-primary">View Report</a></td></tr>
                 <tr><td>11:30 AM</td><td>John Doe</td><td>Dr. Emily Davis</td><td><span className="status-badge danger">Cancelled</span></td><td>-</td></tr>
              </tbody>
           </table>
        </section>
    </motion.div>
  );
}

function DirectoryView() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <section className="admin-section">
           <div className="section-header">
              <h3><BlurText text="Clinic Directory" delay={0.1} /></h3>
              <select className="btn-secondary btn-sm" style={{borderColor: 'var(--border-color)', outline: 'none'}}>
                  <option>All Staff</option><option>Doctors</option><option>Patients</option>
              </select>
           </div>
           <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Department</th><th>Contact</th></tr></thead>
              <tbody>
                 <tr><td>#D-882</td><td>Dr. Sarah Jenkins</td><td><span className="status-badge" style={{background: '#EFF6FF', color: 'var(--primary)'}}>Specialist</span></td><td>Cardiology</td><td>sarah.j@doccare.com</td></tr>
                 <tr><td>#D-883</td><td>Dr. Michael Chen</td><td><span className="status-badge" style={{background: '#EFF6FF', color: 'var(--primary)'}}>Specialist</span></td><td>Neurology</td><td>m.chen@doccare.com</td></tr>
                 <tr><td>#P-1029</td><td>Alice Williams</td><td><span className="status-badge pending">Patient</span></td><td>-</td><td>alice.w@email.com</td></tr>
                 <tr><td>#P-1030</td><td>Michael Smith</td><td><span className="status-badge pending">Patient</span></td><td>-</td><td>mike.smith@email.com</td></tr>
                 <tr><td>#A-001</td><td>Admin Root</td><td><span className="status-badge danger">Admin</span></td><td>Operations</td><td>admin@doccare.com</td></tr>
              </tbody>
           </table>
        </section>
    </motion.div>
  );
}

function RecordsView() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <section className="admin-section">
           <div className="section-header">
              <h3><BlurText text="HIPAA Records Vault" delay={0.1} /></h3>
           </div>
           <table className="admin-table">
              <thead><tr><th>Date</th><th>Patient</th><th>Record Type</th><th>Generated By</th><th>Action</th></tr></thead>
              <tbody>
                 <tr><td>March 14, 2026</td><td>Michael Smith</td><td>Neurology MRI Report</td><td>Dr. Michael Chen</td><td><button className="btn-primary" style={{padding: '0.4rem 1rem', fontSize:'0.8rem'}}>Decrypt & View</button></td></tr>
                 <tr><td>March 13, 2026</td><td>John Doe</td><td>General Bloodwork</td><td>Dr. Sarah Jenkins</td><td><button className="btn-primary" style={{padding: '0.4rem 1rem', fontSize:'0.8rem'}}>Decrypt & View</button></td></tr>
                 <tr><td>March 11, 2026</td><td>Alice Williams</td><td>Cardiology Assessment</td><td>Dr. Sarah Jenkins</td><td><button className="btn-primary" style={{padding: '0.4rem 1rem', fontSize:'0.8rem'}}>Decrypt & View</button></td></tr>
              </tbody>
           </table>
        </section>
    </motion.div>
  );
}

function SettingsView() {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
        <section className="admin-section" style={{maxWidth: '800px'}}>
           <div className="section-header">
              <h3><BlurText text="System Configuration" delay={0.1} /></h3>
           </div>
           
           <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem'}}>
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)'}}>
               <div>
                  <h4 style={{fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--text-main)'}}>SMS Notifications</h4>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>Automatically send booking confirmations & reports via Twilio SMS.</p>
               </div>
               <button className="status-badge success" style={{border:'none', cursor:'pointer', padding: '0.6rem 1.2rem'}}>Enabled</button>
             </div>
             
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)'}}>
               <div>
                  <h4 style={{fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--text-main)'}}>Strict 30-Min Slots</h4>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>Enforce 30 minute rigid calendar increments globally.</p>
               </div>
               <button className="status-badge success" style={{border:'none', cursor:'pointer', padding: '0.6rem 1.2rem'}}>Enabled</button>
             </div>

             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)'}}>
               <div>
                  <h4 style={{fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--text-main)'}}>Emergency Ward Status</h4>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>Redirects new patient bookings to critical care queue.</p>
               </div>
               <button className="status-badge danger" style={{border:'none', background: 'var(--surface)', color: 'var(--text-muted)', cursor:'pointer', padding: '0.6rem 1.2rem'}}>Disabled</button>
             </div>
           </div>
        </section>
    </motion.div>
  );
}
