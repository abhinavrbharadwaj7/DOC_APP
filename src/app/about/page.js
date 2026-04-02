'use client';
import { motion } from 'framer-motion';
import { BlurText } from '../../components/ReactBits/BlurText';
import './about.css';

export default function About() {
  return (
    <div className="about-container">
      <div className="about-hero container">
         <div className="about-text-content">
            <h1 className="about-title">
               <BlurText text="Redefining the" delay={0.1} />
               <BlurText text="Standard." delay={0.25} />
            </h1>
            <motion.p 
               className="about-desc"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6, duration: 0.8 }}
            >
               DocCare was founded on a singular principle: healthcare shouldn't feel like a bureaucracy. We have engineered a clinic environment that merges legendary medical talent with absolute architectural and digital fluidity.
            </motion.p>
         </div>
         
         <motion.div 
            className="about-image-wrapper"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1.2, type: "spring" }}
         >
            <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop" alt="Clinic Interior" className="about-img" />
            <div className="image-overlay"></div>
         </motion.div>
      </div>

      <motion.div 
         className="milestone-ticker container"
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.9, duration: 0.8 }}
      >
         <div className="milestone">
            <h3>2019</h3>
            <span>Founded in NY</span>
         </div>
         <div className="divider"></div>
         <div className="milestone">
            <h3>12k+</h3>
            <span>Patients Healed</span>
         </div>
         <div className="divider"></div>
         <div className="milestone">
            <h3>Zero</h3>
            <span>Data Breaches</span>
         </div>
         <div className="divider"></div>
         <div className="milestone">
            <h3>No. 1</h3>
            <span>Regional Clinic</span>
         </div>
      </motion.div>
    </div>
  )
}
