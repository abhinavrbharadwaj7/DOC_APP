'use client';
import { Calendar, Clock, User, CheckCircle, FileUp, AlertCircle } from 'lucide-react';
import './doctor-dashboard.css';

const TODAY_SCHEDULE = [
  { id: "A1", time: "09:00 AM", patient: "Alice Williams", reason: "Routine Checkup", status: "pending", new: true },
  { id: "A2", time: "10:30 AM", patient: "John Doe", reason: "Mild fever and cough", status: "pending", new: false },
  { id: "A3", time: "02:00 PM", patient: "Michael Smith", reason: "Follow-up", status: "completed", new: false }
];

export default function DoctorDashboard() {
  return (
    <div className="doc-dash-container">
      <header className="doc-header glass-panel">
        <div className="doc-info">
           <h2>Dr. Sarah Jenkins</h2>
           <p>Cardiology Department</p>
        </div>
        <div className="doc-stats">
           <div className="stat-pill"><User size={16}/> 12 Patients Today</div>
           <div className="stat-pill warning"><AlertCircle size={16}/> 2 Pending Reports</div>
        </div>
      </header>

      <div className="main-content">
        <div className="schedule-header">
           <h3>Today's Schedule</h3>
           <span>March 14, 2026</span>
        </div>

        <div className="appointments-list animate-fade-in">
          {TODAY_SCHEDULE.map((apt, idx) => (
            <div key={apt.id} className={`apt-row glass-panel ${apt.status === 'completed' ? 'completed-row' : ''}`} style={{animationDelay: `${idx * 0.1}s`}}>
              <div className="apt-time">
                <Clock size={20} className="time-icon"/>
                <strong>{apt.time}</strong>
                <span className="duration">30m</span>
              </div>
              
              <div className="apt-details">
                <div className="patient-name">
                  <h4>{apt.patient}</h4>
                  {apt.new && <span className="badge-new">New Patient</span>}
                </div>
                <p className="apt-reason"><strong>Reason:</strong> {apt.reason}</p>
              </div>

              <div className="apt-actions">
                {apt.status === 'completed' ? (
                  <span className="status-badge success"><CheckCircle size={16}/> Completed</span>
                ) : (
                  <>
                    <button className="btn-secondary btn-sm action-btn">
                      <FileUp size={16}/>  Rx / Notes
                    </button>
                    <button className="btn-primary btn-sm action-btn">
                      <CheckCircle size={16}/> Done
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
