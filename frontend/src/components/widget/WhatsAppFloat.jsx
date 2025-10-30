import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

const WhatsAppFloat = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/918767836233', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9998]">
      {/* WhatsApp Floating Button */}
      <motion.button
        onClick={handleWhatsAppClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 z-50 relative"
        aria-label="Contact us on WhatsApp"
      >
        <FaWhatsapp className="text-xl" />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-75 animate-ping"></div>
        <div className="absolute inset-0 rounded-full bg-green-500 opacity-50 animate-pulse"></div>
      </motion.button>
    </div>
  );
};

export default WhatsAppFloat;
