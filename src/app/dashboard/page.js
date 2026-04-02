'use client';
import { Calendar as CalendarIcon, FileText, Download, Activity, Settings } from 'lucide-react';
import './dashboard.css';

const UPCOMING_APPOINTMENTS = [
  { id: "A123", doctor: "Dr. Sarah Jenkins", date: "April 15, 2026", time: "10:30 AM", status: "Confirmed" }
];

const PAST_RECORDS = [
  { id: "R1", doctor: "Dr. Emily Davis", date: "Jan 10, 2026", type: "Pediatric Consultation", reportAvailable: true, prescriptionUrl: "#" },
  { id: "R2", doctor: "Dr. Michael Chen", date: "Nov 05, 2025", type: "Neurology Follow-up", reportAvailable: true, prescriptionUrl: "#" }
];

export default function PatientDashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar glass-panel">
        <div className="user-profile">
          <div className="avatar">JD</div>
          <h3>John Doe</h3>
          <p>Patient ID: #88392</p>
        </div>
        <nav className="dashboard-nav">
          <a href="#" className="nav-item active"><CalendarIcon size={20}/> Appointments</a>
          <a href="#" className="nav-item"><FileText size={20}/> Medical Records</a>
          <a href="#" className="nav-item"><Settings size={20}/> Settings</a>
        </nav>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-header">
          <h2>Welcome Back, John</h2>
          <p>Here is an overview of your medical journey.</p>
        </div>

        <section className="dashboard-section animate-fade-in">
          <h3>Upcoming Appointments</h3>
          {UPCOMING_APPOINTMENTS.length > 0 ? (
            <div className="appointment-card glass-panel">
              <div className="apt-info">
                <h4>{UPCOMING_APPOINTMENTS[0].doctor}</h4>
                <div className="apt-meta">
                  <span><CalendarIcon size={16}/> {UPCOMING_APPOINTMENTS[0].date}</span>
                  <span><Activity size={16}/> {UPCOMING_APPOINTMENTS[0].time}</span>
                </div>
              </div>
              <div className="apt-status status-confirmed">
                {UPCOMING_APPOINTMENTS[0].status}
              </div>
            </div>
          ) : (
             <p className="empty-state">No upcoming appointments. <a href="/book">Book one now.</a></p>
          )}
        </section>

        <section className="dashboard-section animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h3>Medical Records & Prescriptions</h3>
          <p className="section-desc">View and download reports sent to your SMS.</p>
          
          <div className="records-grid">
            {PAST_RECORDS.map(record => (
              <div key={record.id} className="record-card glass-panel">
                <div className="record-header">
                  <FileText className="record-icon" size={24}/>
                  <div>
                    <h4>{record.type}</h4>
                    <span className="record-date">{record.date}</span>
                  </div>
                </div>
                <p className="record-doc">Consulted with: {record.doctor}</p>
                <div className="record-actions">
                  <button className="btn-secondary btn-sm"><Download size={16}/> Report</button>
                  <button className="btn-primary btn-sm"><Download size={16}/> Prescription</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
