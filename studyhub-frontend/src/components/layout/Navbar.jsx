import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  BookOpen, 
  Upload, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Users, 
  FileText, 
  Settings, 
  GraduationCap, 
  MessageSquare, 
  ChevronDown, 
  Shield,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    isTeacher, 
    isStudent, 
    logout,
    userDepartment 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Get nav links based on role
  const getNavLinks = () => {
    const links = [];

    // Common links for all authenticated users
    if (isAuthenticated) {
      links.push({
        to: '/',
        label: 'Home',
        icon: Home,
        active: location.pathname === '/'
      });
    }

    // Student links
    if (isStudent) {
      links.push(
        {
          to: '/materials',
          label: 'Materials',
          icon: BookOpen,
          active: location.pathname.startsWith('/materials')
        },
        {
          to: '/doubts',
          label: 'Ask Teacher',
          icon: HelpCircle,
          active: location.pathname === '/doubts'
        },
        {
          to: '/chatbot',
          label: 'AI Tutor',
          icon: MessageSquare,
          active: location.pathname === '/chatbot'
        }
      );
    }

    // Teacher links
    if (isTeacher) {
      links.push(
        {
          to: '/teacher/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          active: location.pathname === '/teacher/dashboard'
        },
        {
          to: '/teacher/queries',
          label: 'Student Doubts',
          icon: HelpCircle,
          active: location.pathname === '/teacher/queries'
        },
        {
          to: '/upload',
          label: 'Upload Note',
          icon: Upload,
          active: location.pathname === '/upload'
        },
        {
          to: '/my-materials',
          label: 'My Uploads',
          icon: FileText,
          active: location.pathname === '/my-materials'
        },
        {
          to: '/chatbot',
          label: 'AI Tutor',
          icon: MessageSquare,
          active: location.pathname === '/chatbot'
        }
      );
    }

    // Admin links
    if (isAdmin) {
      links.push(
        {
          to: '/admin/dashboard',
          label: 'Dashboard',
          icon: LayoutDashboard,
          active: location.pathname === '/admin/dashboard'
        },
        {
          to: '/admin/users',
          label: 'Users',
          icon: Users,
          active: location.pathname === '/admin/users'
        },
        {
          to: '/admin/materials',
          label: 'Materials',
          icon: FileText,
          active: location.pathname === '/admin/materials'
        },
        {
          to: '/admin/curriculum',
          label: 'Curriculum',
          icon: GraduationCap,
          active: location.pathname === '/admin/curriculum'
        },
        
        {
          to: '/chatbot',
          label: 'AI Tutor',
          icon: MessageSquare,
          active: location.pathname === '/chatbot'
        }
      );
    }

    return links;
  };

  // Get user role display name
  const getRoleDisplay = () => {
    if (!user) return '';
    const role = user.role || '';
    if (role === 'ROLE_ADMIN') return 'Admin';
    if (role === 'ROLE_TEACHER') return 'Faculty';
    if (role === 'ROLE_STUDENT') return 'Student';
    return role.replace('ROLE_', '');
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 bg-white border-b border-slate-100 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* VVIT College Logo & Branding */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-11 px-2.5 rounded-xl overflow-hidden shadow-xs border border-slate-200/80 bg-white flex items-center justify-center group-hover:shadow-sm transition-all">
                <img 
                  src="/vvit-logo.png" 
                  alt="VVIT University Logo" 
                  className="h-8 w-auto max-w-[120px] object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold text-[#0f2744] tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                  VVIT StudyHub
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase leading-none mt-0.5">
                  Vasireddy Venkatadri Intl Tech University
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      link.active
                        ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100/60 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <link.icon className={`w-4 h-4 ${link.active ? 'text-blue-600' : 'text-slate-500'}`} />
                    {link.label}
                  </Link>
                ))}

                {/* User Dropdown */}
                <div className="relative user-dropdown ml-4 pl-3 border-l border-slate-200">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2.5 py-1.5 px-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0f2744] flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                      {user?.firstName?.[0] || 'U'}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-bold text-slate-900 capitalize leading-tight">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5">
                        {getRoleDisplay()}
                      </p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 text-sm capitalize">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {getRoleDisplay()}
                          </span>
                          {(userDepartment || user?.department) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                              {userDepartment || user?.department}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick Links */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          My Profile
                        </Link>
                        
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" />
                            Admin Dashboard
                          </Link>
                        )}
                        
                        {isTeacher && (
                          <Link
                            to="/teacher/dashboard"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <LayoutDashboard className="w-4 h-4 text-slate-500" />
                            Teacher Dashboard
                          </Link>
                        )}

                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          Settings
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 shadow-lg">
          <div className="space-y-1">
            {isAuthenticated ? (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100 mb-2">
                  <div className="w-9 h-9 rounded-full bg-[#0f2744] flex items-center justify-center text-white font-bold text-sm">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      link.active
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;