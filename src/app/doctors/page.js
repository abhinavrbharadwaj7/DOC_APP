'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MapPin, Clock, Search, ChevronRight, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { BlurText } from '../../components/ReactBits/BlurText';
import './doctors.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
};
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 15 } }
};

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctors')
      .then(r => r.json())
      .then(data => {
        setDoctors(data.doctors || []);
        setFiltered(data.doctors || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(doctors.filter(d =>
      d.name.toLowerCase().includes(q) || (d.specialty || '').toLowerCase().includes(q)
    ));
  }, [search, doctors]);

  return (
    <div className="doctors-page-container">
      <div className="noise-overlay" style={{ opacity: 0.05 }}></div>

      <header className="doctors-header">
        <div className="container">
          <h1 className="doctors-title">
            <BlurText text="Our Specialists" delay={0.1} />
          </h1>
          <motion.p className="doctors-subtitle"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            Connect with our world-class medical team and book your precise 30-minute consultation slot.
          </motion.p>

          <motion.div className="search-bar editorial-card"
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </motion.div>
        </div>
      </header>

      <section className="doctors-list container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            Loading specialists...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
            {doctors.length === 0
              ? 'No doctors registered yet. Doctors can sign up at /register.'
              : 'No results found for your search.'}
          </div>
        ) : (
          <motion.div className="grid-cols-2" variants={containerVariants} initial="hidden" animate="visible">
            {filtered.map((doc) => (
              <motion.div key={doc._id} className="doctor-card editorial-card" variants={cardVariants}>
                <div className="doc-avatar">
                  <div className="doc-avatar-placeholder">
                    <Stethoscope size={40} color="var(--primary)" />
                  </div>
                </div>
                <div className="doc-info">
                  <h3>{doc.name}</h3>
                  <span className="doc-specialty">{doc.specialty || 'General Practice'}</span>

                  <div className="doc-meta">
                    <span className="meta-item"><Clock size={16} /> Available: 30-min slots</span>
                    <span className="meta-item"><MapPin size={16} /> Main Clinic</span>
                    {doc.phone && <span className="meta-item"><Star size={16} /> {doc.phone}</span>}
                  </div>

                  <div className="doc-actions">
                    <Link href={`/book?doctorId=${doc._id}&doctorName=${encodeURIComponent(doc.name)}&specialty=${encodeURIComponent(doc.specialty || 'General')}`}
                      className="btn-secondary">
                      Book Slot <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}
