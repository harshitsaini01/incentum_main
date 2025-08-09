import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, setUser, ready } = useContext(UserContext);
  const navigate = useNavigate();
  const servicesDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log("User in Header:", user);
    const handleClickOutside = (event) => {
      if (event.target.closest(".user-profile-dropdown") === null) {
        setShowLogout(false);
      }
      if (
        servicesDropdownRef.current &&
        !servicesDropdownRef.current.contains(event.target)
      ) {
        setIsServicesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  if (!ready) return null;

  const toggleServicesDropdown = () => setIsServicesDropdownOpen(!isServicesDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/users/logout`,
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

  const handleServiceClick = (path) => {
    navigate(path);
    setIsServicesDropdownOpen(false);
    if (isMobileMenuOpen) toggleMobileMenu();
  };

  const userName = user?.data?.name || user?.name || "User";

  const serviceItems = [
    { name: "Home Loan", path: "/home-loan", icon: <FaHome className="w-5 h-5" />, color: "text-blue-500" },
    { name: "Vehicle Loan", path: "/vehicle-loan", icon: <MdDirectionsCar className="w-5 h-5" />, color: "text-green-500" },
    { name: "Personal Loan", path: "/personal-loan", icon: <MdPerson className="w-5 h-5" />, color: "text-purple-500" },
    { name: "Business Loan", path: "/business-loan", icon: <MdBusiness className="w-5 h-5" />, color: "text-yellow-500" },
    { name: "Mortgage Loan", path: "/mortgage-loan", icon: <MdAccountBalance className="w-5 h-5" />, color: "text-red-500" },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/20' 
          : 'bg-gradient-to-r from-blue-900/95 via-blue-800/95 to-blue-900/95 backdrop-blur-xl'
      }`}
    >
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo Section */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <Link to="/" className="flex items-center space-x-2">
              <img src={logo} alt="Incentum Financial" className="w-32 h-14 object-contain" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 ${
                scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'
              }`}
            >
              <FaHome className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/about-us"
              className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 ${
                scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'
              }`}
            >
              <FaInfoCircle className="w-4 h-4" />
              <span>About</span>
            </Link>

            {/* EMI Calculator */}
            <Link
              to="/emi-calculator"
              className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 ${
                scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'
              }`}
            >
              <FaCalculator className="w-4 h-4" />
              <span>EMI Calculator</span>
            </Link>

            {/* Contact */}
            <Link
              to="/contact-us"
              className={`flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105 ${
                scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'
              }`}
            >
              <FaPhoneAlt className="w-4 h-4" />
              <span>Contact</span>
            </Link>

            {/* Services Dropdown */}
            <div className="relative" ref={servicesDropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={toggleServicesDropdown}
                className={`flex items-center space-x-2 font-medium transition-all duration-300 ${
                  scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-300'
                }`}
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
                    className="absolute left-0 mt-2 w-64 bg-gray-900 rounded-lg shadow-2xl py-2 z-50 overflow-hidden border border-gray-800"
                  >
                    <div className="px-4 py-3 border-b border-gray-800">
                    </div>
                    <div className="divide-y divide-gray-800">
                      {serviceItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${item.color}`}
                          onClick={() => handleServiceClick(item.path)}
                        >
                          <div className={`p-1.5 rounded-lg bg-white/10`}>
                            {React.cloneElement(item.icon, { className: 'w-4 h-4' })}
                          </div>
                          <span className="ml-3 text-sm font-medium text-white">{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative user-profile-dropdown">
                <button
                  onClick={() => setShowLogout(!showLogout)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <FaUserCircle className="w-5 h-5" />
                  <span className="hidden md:inline">
                    {userName.split(" ")[0]}
                  </span>
                </button>

                {showLogout && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowLogout(false)}
                    >
                      <FaUser className="mr-2" /> My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      <FaSignOutAlt className="mr-2" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login-page"
                  className="hidden md:block bg-white text-blue-700 hover:bg-gray-100 px-6 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Login
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-gray-200 focus:outline-none p-2"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="w-6 h-6" />
                ) : (
                  <FaBars className="w-6 h-6" />
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
            className="md:hidden bg-white shadow-lg overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/"
                className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={toggleMobileMenu}
              >
                Home
              </Link>
              
              <div className="relative">
                <button
                  onClick={toggleServicesDropdown}
                  className="w-full flex justify-between items-center py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <span>Our Services</span>
                  <FaChevronDown
                    className={`transition-transform ${
                      isServicesDropdownOpen ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {isServicesDropdownOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {serviceItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center py-2 px-3 hover:bg-gray-100 rounded-lg ${item.color}`}
                        onClick={() => handleServiceClick(item.path)}
                      >
                        {item.icon}
                        <span className="ml-2 text-gray-700">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {!user && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    to="/login-page"
                    className="block py-2 px-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup-page"
                    className="block py-2 px-3 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
  );
};

export default Header;
