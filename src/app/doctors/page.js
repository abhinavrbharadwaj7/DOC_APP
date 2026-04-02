'use client';
import Link from 'next/link';
import { Star, MapPin, Clock, Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { BlurText } from '../../components/ReactBits/BlurText';
import './doctors.css';

const MOCK_DOCTORS = [
  { id: 1, name: "Dr. Sarah Jenkins", specialty: "Cardiologist", rating: 4.9, experience: "15 Years", image: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 2, name: "Dr. Michael Chen", specialty: "Neurologist", rating: 4.8, experience: "12 Years", image: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 3, name: "Dr. Emily Davis", specialty: "Pediatrician", rating: 4.9, experience: "10 Years", image: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: 4, name: "Dr. James Wilson", specialty: "Orthopedic", rating: 4.7, experience: "18 Years", image: "https://randomuser.me/api/portraits/men/46.jpg" },
  { id: 5, name: "Dr. Olivia Martinez", specialty: "Dermatologist", rating: 4.8, experience: "8 Years", image: "https://randomuser.me/api/portraits/women/24.jpg" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  }
};

export default function DoctorsList() {
  return (
    <div className="doctors-page-container">
      <div className="noise-overlay" style={{opacity: 0.05}}></div>
      
      <header className="doctors-header">
        <div className="container">
          <h1 className="doctors-title">
             <BlurText text="Our Specialists" delay={0.1} />
          </h1>
          <motion.p 
            className="doctors-subtitle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Connect with our world-class medical team and book your precise 30-minute consultation slot immediately.
          </motion.p>
          
          <motion.div 
            className="search-bar editorial-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Search className="search-icon" size={20} />
            <input type="text" placeholder="Search by name or specialty..." />
            <button className="btn-primary">Search Directory</button>
          </motion.div>
        </div>
      </header>

      <section className="doctors-list container">
        <motion.div 
           className="grid-cols-2"
           variants={containerVariants}
           initial="hidden"
           animate="visible"
        >
          {MOCK_DOCTORS.map((doc) => (
            <motion.div key={doc.id} className="doctor-card editorial-card" variants={cardVariants}>
              <div className="doc-avatar">
                <img src={doc.image} alt={doc.name} />
                <div className="doc-rating">
                   <Star className="icon-star" fill="currentColor" size={12}/> {doc.rating}
                </div>
              </div>
              <div className="doc-info">
                <h3>{doc.name}</h3>
                <span className="doc-specialty">{doc.specialty}</span>
                
                <div className="doc-meta">
                  <span className="meta-item"><Clock size={16}/> {doc.experience}</span>
                  <span className="meta-item"><MapPin size={16}/> Main Clinic</span>
                </div>
                
                <div className="doc-actions">
                  <Link href={`/book?doctorId=${doc.id}`} className="btn-secondary">
                    View Slots <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
