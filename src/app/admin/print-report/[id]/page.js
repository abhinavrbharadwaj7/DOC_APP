'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';
import './print-report.css';

export default function PrintReportPage({ params }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/appointments/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.appointment) {
          setAppointment(data.appointment);
        } else {
          setError('Appointment completely missing.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Network Error.');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!loading && appointment) {
      // Auto-trigger print dialog after a tiny delay so images and fonts render
      const timer = setTimeout(() => {
        window.print();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [loading, appointment]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading Document...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red', fontFamily: 'sans-serif' }}>{error}</div>;

  return (
    <div className="print-container">
      {/* Action Bar (Hidden when printing via CSS) */}
      <div className="no-print print-actions">
        <button onClick={() => window.close()} className="btn-secondary">Close Tab</button>
        <button onClick={() => window.print()} className="btn-primary">🖨️ Print / Save as PDF</button>
      </div>

      <div className="report-paper">
        <div className="report-header">
           <div className="clinic-brand">
             <Activity size={36} color="#2563eb" />
             <div>
               <h1>DocCare Clinic</h1>
               <p>123 Medical Innovation Drive, Care City, NY 10001</p>
               <p>Phone: +1 800-DOC-CARE | Web: portal.doccare.com</p>
             </div>
           </div>
           <div className="report-meta">
             <h2>CLINICAL REPORT</h2>
             <p><strong>Report ID:</strong> #{appointment._id.slice(-6).toUpperCase()}</p>
             <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()} {appointment.slot}</p>
           </div>
        </div>

        <hr className="divider" />

        <div className="patient-demographics section">
          <div className="patient-col">
            <p className="label">Patient Name</p>
            <p className="value">{appointment.patientId?.name || 'N/A'}</p>
          </div>
          <div className="patient-col" style={{ flex: 1 }}>
            <p className="label">Contact Info</p>
            <p className="value">{appointment.patientId?.phone || appointment.patientId?.email || 'N/A'}</p>
          </div>
          <div className="patient-col" style={{ textAlign: 'right' }}>
            <p className="label">Attending Doctor</p>
            <p className="value">Dr. {appointment.doctorId?.name || 'N/A'} <br/><span className="spec">({appointment.doctorId?.specialty || 'General'})</span></p>
          </div>
        </div>

        <div className="clinical-notes section">
          <h3>Presenting Complaint</h3>
          <p className="pre-wrap">{appointment.reason}</p>
        </div>

        {appointment.notes && (
          <div className="clinical-notes section bg-light">
            <h3>Clinical Findings & Notes</h3>
            <pre className="pre-wrap">{appointment.notes}</pre>
          </div>
        )}

        {appointment.prescriptionUrl && (
          <div className="clinical-notes section">
            <h3>Rx Prescription</h3>
            <pre className="pre-wrap signature-font">{appointment.prescriptionUrl}</pre>
          </div>
        )}

        {appointment.reportUrl && (
          <div className="clinical-notes section">
            <h3>Attached Medical File</h3>
            <p><strong>Ref:</strong> <a href={appointment.reportUrl}>{appointment.reportUrl}</a></p>
          </div>
        )}

        <div className="doctor-signature">
           <div className="sig-line"></div>
           <p>Dr. {appointment.doctorId?.name}</p>
           <p className="light-text">Authorized Signature</p>
        </div>
      </div>
    </div>
  );
}
