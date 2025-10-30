import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown, FaBars, FaTimes, FaHome, FaInfoCircle, FaCalculator, FaPhoneAlt, FaUser, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { MdAccountBalance, MdDirectionsCar, MdPerson, MdBusiness } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import logo from "../../assets/logo.webp";
import { UserContext } from "../../contextapi/UserContext";

const Header = () => {
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showMobileUserDropdown, setShowMobileUserDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, setUser, ready } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const servicesDropdownRef = useRef(null);
  const userButtonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset mobile menu and dropdown when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesDropdownOpen(false);
    setShowMobileUserDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      setTimeout(() => {
        // Check if click is outside user dropdown
        if (
          userButtonRef.current &&
          !userButtonRef.current.contains(event.target)
        ) {
          setShowLogout(false);
        }
        
        // Check if click is outside services dropdown
        if (
          servicesDropdownRef.current &&
          !servicesDropdownRef.current.contains(event.target)
        ) {
          setIsServicesDropdownOpen(false);
        }
      }, 100);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  if (!ready) return null;

  const toggleServicesDropdown = () => setIsServicesDropdownOpen(!isServicesDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleUserDropdownToggle = () => {
    setShowLogout(!showLogout);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        '/api/users/logout',
        {},
        { withCredentials: true }
      );
      console.log("Logout Response:", response.data);

      localStorage.removeItem("token");
      setUser(null);

      toast.success("Logout successful!", {
        position: "top-center",
        autoClose: 2000,
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      navigate("/");
    } catch (err) {
      console.error("Logout Error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.status === 500
          ? "Server error during logout. Please try again."
          : err.response?.data?.message || "Logout failed";
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const userName = user?.data?.name || user?.name || "User";

  return (
    <>
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-blue-900/95 backdrop-blur-xl ${
          scrolled 
            ? 'shadow-lg border-b border-gray-200/20' 
            : ''
        }`}
        style={{ minWidth: '100vw' }}
      >
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative" style={{ overflow: 'visible' }}>
        <div className="flex justify-between items-center py-3 w-full min-w-0 relative" style={{ overflow: 'visible' }}>
          {/* Logo Section */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 flex-shrink-0"
          >
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Incentum Financial" className="w-24 sm:w-28 md:w-32 h-10 sm:h-12 md:h-14 object-contain" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 text-white hover:text-blue-300`}
            >
              <FaHome className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/about-us"
              className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 text-white hover:text-blue-300`}
            >
              <FaInfoCircle className="w-4 h-4" />
              <span>About</span>
            </Link>

            {/* EMI Calculator */}
            <Link
              to="/emi-calculator"
              className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 text-white hover:text-blue-300`}
            >
              <FaCalculator className="w-4 h-4" />
              <span>EMI Calculator</span>
            </Link>

            {/* Contact */}
            <Link
              to="/contact-us"
              className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 text-white hover:text-blue-300`}
            >
              <FaPhoneAlt className="w-4 h-4" />
              <span>Contact</span>
            </Link>

            {/* Services Dropdown */}
            <div className="relative" ref={servicesDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={toggleServicesDropdown}
                className={`flex items-center space-x-2 font-medium transition-all duration-300 text-white hover:text-blue-300`}
              >
                <span>Services</span>
                <motion.div
                  animate={{ rotate: isServicesDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaChevronDown className="w-3 h-3" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isServicesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 w-64 bg-white rounded-lg shadow-2xl py-2 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-gray-300 bg-white">
                    </div>
                    <div className="divide-y divide-gray-300 bg-white">
                      {/* Home Loan */}
                      <Link
                        to="/home-loan"
                        className="flex items-center px-4 py-3 bg-white hover:bg-blue-50 transition-colors text-blue-500"
                        onClick={() => setIsServicesDropdownOpen(false)}
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/20">
                          <FaHome className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-800">Home Loan</span>
                      </Link>
                      
                      {/* Vehicle Loan */}
                      <Link
                        to="/vehicle-loan"
                        className="flex items-center px-4 py-3 bg-white hover:bg-blue-50 transition-colors text-green-500"
                        onClick={() => setIsServicesDropdownOpen(false)}
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/20">
                          <MdDirectionsCar className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-800">Vehicle Loan</span>
                      </Link>
                      
                      {/* Personal Loan */}
                      <Link
                        to="/personal-loan"
                        className="flex items-center px-4 py-3 bg-white hover:bg-blue-50 transition-colors text-purple-500"
                        onClick={() => setIsServicesDropdownOpen(false)}
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/20">
                          <MdPerson className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-800">Personal Loan</span>
                      </Link>
                      
                      {/* Business Loan */}
                      <Link
                        to="/business-loan"
                        className="flex items-center px-4 py-3 bg-white hover:bg-blue-50 transition-colors text-yellow-500"
                        onClick={() => setIsServicesDropdownOpen(false)}
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/20">
                          <MdBusiness className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-800">Business Loan</span>
                      </Link>
                      
                      {/* Mortgage Loan */}
                      <Link
                        to="/mortgage-loan"
                        className="flex items-center px-4 py-3 bg-white hover:bg-blue-50 transition-colors text-red-500"
                        onClick={() => setIsServicesDropdownOpen(false)}
                      >
                        <div className="p-1.5 rounded-lg bg-blue-500/20">
                          <MdAccountBalance className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-800">Mortgage Loan</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {user ? (
              <div className="relative" ref={userButtonRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserDropdownToggle();
                  }}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <FaUserCircle className="w-5 h-5" />
                  <span className="hidden md:inline">
                    {userName.split(" ")[0]}
                  </span>
                  <FaChevronDown
                    className={`w-3 h-3 ml-1 transition-transform ${
                      showLogout ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {showLogout && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-white-600">
                    {/* <div className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <FaUserCircle className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-white">{userName}</span>
                      </div>
                    </div> */}
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-black bg-gray-100 hover:bg-gray-300 transition-colors"
                      onClick={() => setShowLogout(false)}
                    >
                      <FaUser className="w-4 h-4 mr-3" />
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowLogout(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-red-600 bg-gray-100 hover:bg-gray-300 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login-page"
                  className="hidden md:block bg-white text-blue-700 hover:bg-gray-100 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base whitespace-nowrap"
                >
                  Login
                </Link>
              </>
            )}

            {/* Mobile Menu Button - Fixed positioning */}
            <div className="flex md:hidden ml-2">
              <button
                onClick={toggleMobileMenu}
                className="relative z-[60] text-white hover:text-gray-200 focus:outline-none p-3 rounded-lg hover:bg-white/10 transition-all duration-200 border border-white/30 bg-white/5"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="w-5 h-5" />
                ) : (
                  <FaBars className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-gradient-to-b from-blue-900/98 via-blue-800/98 to-blue-900/98 backdrop-blur-lg shadow-lg overflow-hidden border-t border-white/20"
          >
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/"
                className="block py-2 px-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>

              <Link
                to="/about-us"
                className="block py-2 px-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                About Us
              </Link>

              <Link
                to="/emi-calculator"
                className="block py-2 px-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                EMI Calculator
              </Link>

              <Link
                to="/contact-us"
                className="block py-2 px-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                Contact Us
              </Link>
              
              <div className="relative" ref={servicesDropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleServicesDropdown();
                  }}
                  className="w-full flex justify-between items-center py-2 px-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <span>Our Services</span>
                  <FaChevronDown
                    className={`transition-transform text-white ${
                      isServicesDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isServicesDropdownOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {/* Home Loan */}
                    <Link
                      to="/home-loan"
                      className="flex items-center py-2 px-3 hover:bg-white/10 rounded-lg transition-colors duration-200 text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsServicesDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <FaHome className="w-4 h-4 text-white" />
                      <span className="ml-2 text-white">Home Loan</span>
                    </Link>
                    
                    {/* Vehicle Loan */}
                    <Link
                      to="/vehicle-loan"
                      className="flex items-center py-2 px-3 hover:bg-white/10 rounded-lg transition-colors duration-200 text-green-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsServicesDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <MdDirectionsCar className="w-4 h-4 text-white" />
                      <span className="ml-2 text-white">Vehicle Loan</span>
                    </Link>
                    
                    {/* Personal Loan */}
                    <Link
                      to="/personal-loan"
                      className="flex items-center py-2 px-3 hover:bg-white/10 rounded-lg transition-colors duration-200 text-purple-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsServicesDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <MdPerson className="w-4 h-4 text-white" />
                      <span className="ml-2 text-white">Personal Loan</span>
                    </Link>
                    
                    {/* Business Loan */}
                    <Link
                      to="/business-loan"
                      className="flex items-center py-2 px-3 hover:bg-white/10 rounded-lg transition-colors duration-200 text-yellow-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsServicesDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <MdBusiness className="w-4 h-4 text-white" />
                      <span className="ml-2 text-white">Business Loan</span>
                    </Link>
                    
                    {/* Mortgage Loan */}
                    <Link
                      to="/mortgage-loan"
                      className="flex items-center py-2 px-3 hover:bg-white/10 rounded-lg transition-colors duration-200 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsServicesDropdownOpen(false);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <MdAccountBalance className="w-4 h-4 text-white" />
                      <span className="ml-2 text-white">Mortgage Loan</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* User Section for Mobile */}
              {user ? (
                <>
                  <div className="border-t border-white/20 my-2"></div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMobileUserDropdown(!showMobileUserDropdown);
                      }}
                      className="w-full flex justify-between items-center py-2 px-3 text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <FaUserCircle className="w-5 h-5" />
                        <span className="font-medium">{userName}</span>
                      </div>
                      <FaChevronDown
                        className={`transition-transform text-white ${
                          showMobileUserDropdown ? "transform rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showMobileUserDropdown && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link
                          to="/profile"
                          className="flex items-center py-2 px-3 hover:bg-white/10 rounded-lg transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMobileUserDropdown(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <FaUser className="w-4 h-4 text-white" />
                          <span className="ml-2 text-white">My Profile1</span>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogout();
                            setShowMobileUserDropdown(false);
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center py-2 px-3 text-red-300 hover:bg-white/10 rounded-lg transition-colors duration-200"
                        >
                          <FaSignOutAlt className="w-4 h-4 text-red-300" />
                          <span className="ml-2 text-red-300">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="border-t border-white/20 my-2"></div>
                  <Link
                    to="/login-page"
                    className="block py-2 px-3 text-center bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup-page"
                    className="block py-2 px-3 text-center bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
                    onClick={toggleMobileMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
    </>
  );
};

export default Header;
