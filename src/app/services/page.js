'use client';
import { motion } from 'framer-motion';
import { HeartPulse, Stethoscope, Microscope, Brain, Baby, Activity } from 'lucide-react';
import { BlurText } from '../../components/ReactBits/BlurText';
import './services.css';

const services = [
  { icon: HeartPulse, title: "Cardiology", desc: "Advanced heart care, diagnostics, and customized treatment plans via world-class specialists." },
  { icon: Brain, title: "Neurology", desc: "Comprehensive care for brain and nervous system disorders utilizing cutting-edge neuro-imaging." },
  { icon: Baby, title: "Pediatrics", desc: "Dedicated and compassionate wellness checks, vaccinations, and specialized care for children." },
  { icon: Microscope, title: "Pathology", desc: "Rapid, highly accurate laboratory testing embedded directly in our secure digital records ecosystem." },
  { icon: Stethoscope, title: "General Practice", desc: "Routine health examinations, preventive care, and holistic treatment for everyday ailments." },
  { icon: Activity, title: "Orthopedics", desc: "Precision surgical and non-surgical treatments for bones, joints, and muscular recovery." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 15 } 
  }
};

export default function Services() {
  return (
    <div className="services-container">
      <div className="noise-overlay" style={{opacity: 0.15}}></div>
      
      <div className="services-header container">
        <h1><BlurText text="Clinical Expertise." delay={0.1} /></h1>
        <p className="services-subtitle">
           We span six major medical disciplines, ensuring holistic, uncompromised care entirely centralized around the patient.
        </p>
      </div>

      <motion.div 
        className="services-grid container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {services.map((svc, i) => (
          <motion.div key={i} className="service-card" variants={cardVariants}>
            <div className="icon-wrapper">
               <svc.icon size={32} className="service-icon" />
            </div>
            <h3>{svc.title}</h3>
            <p>{svc.desc}</p>
            <div className="service-hover-line"></div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
