import React, { useState, useEffect, useRef } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AllInOneChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can we help you today?', sender: 'bot', timestamp: new Date() }
  ]);
  const messagesEndRef = useRef(null);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    
    // Add user message
    const newMessage = {
      id: messages.length + 1,
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: 'Thank you for your message. Our team will get back to you shortly.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`bg-white text-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col ${isMinimized ? 'h-16' : 'h-[500px] w-80'} transition-all duration-300 border border-gray-200`}
            style={{
              background: 'white',
              '--tw-bg-opacity': '1',
              backgroundColor: 'rgba(255, 255, 255, var(--tw-bg-opacity))',
              '--tw-backdrop-blur': 'none',
              backdropFilter: 'none',
              WebkitBackdropFilter: 'none'
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-sm">
              <div className="flex items-center">
                <FaCommentDots className="mr-2" />
                <h3 className="font-semibold">Chat with Us</h3>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={toggleMinimize} 
                  className="text-white hover:bg-blue-700 p-1 rounded-full transition-colors"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? '+' : '−'}
                </button>
                <button 
                  onClick={toggleChat} 
                  className="text-white hover:bg-blue-700 p-1 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'contact' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('contact')}
                  >
                    Contact
                  </button>
                  <button 
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('chat')}
                  >
                    Chat
                  </button>
                </div>

                {/* Chat Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-white" style={{ backgroundColor: 'white' }}>
                  {activeTab === 'chat' ? (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-[80%] rounded-lg p-3 shadow-sm ${msg.sender === 'user' 
                              ? 'bg-blue-600 text-black rounded-br-none' 
                              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow'}`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1 text-right">
                              {formatTime(new Date(msg.timestamp))}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3">Contact Options</h4>
                        
                        <a 
                          href="https://wa.me/918767836233" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors mb-2"
                        >
                          <FaWhatsapp className="text-green-500 mr-3 text-xl" />
                          <div>
                            <p className="font-medium">WhatsApp</p>
                            <p className="text-xs text-gray-500">Chat with us on WhatsApp</p>
                          </div>
                        </a>
                        
                        <a 
                          href="tel:+918290052977" 
                          className="flex items-center p-3 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors mb-2"
                        >
                          <FaPhone className="text-blue-500 mr-3 text-xl" />
                          <div>
                            <p className="font-medium">Call Us</p>
                            <p className="text-xs text-gray-500">+91 82900 52977</p>
                          </div>
                        </a>
                        
                        <a 
                          href="mailto:info@incentum.ai" 
                          className="flex items-center p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          <FaEnvelope className="text-purple-500 mr-3 text-xl" />
                          <div>
                            <p className="font-medium">Email Us</p>
                            <p className="text-xs text-gray-500">info@incentum.ai</p>
                          </div>
                        </a>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-2">Business Hours</h4>
                        <p className="text-sm text-gray-700">
                          Monday - Friday: 9:00 AM - 6:00 PM<br />
                          Saturday: 10:00 AM - 4:00 PM<br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                {activeTab === 'chat' && (
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white shadow-inner">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                        autoComplete="off"
                      />
                      <button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors"
                        disabled={!message.trim()}
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      {!isOpen && (
        <motion.button
          onClick={toggleChat}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
          aria-label="Open chat"
        >
          <FaCommentDots className="text-xl" />
        </motion.button>
      )}
    </div>
  );
};

export default AllInOneChat;
