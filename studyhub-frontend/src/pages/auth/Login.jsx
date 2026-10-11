import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Hash, 
  AlertCircle, 
  Users, 
  Shield, 
  BookOpen, 
  Briefcase, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import campusBg from '../../assets/images/college-campus.jpg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginSuccess, setLoginSuccess] = useState(false);

  const getDashboardPath = (role) => {
    if (!role) return '/';
    const normalizedRole = role.replace('ROLE_', '').toUpperCase();
    if (normalizedRole === 'ADMIN') return '/admin/dashboard';
    if (normalizedRole === 'TEACHER') return '/teacher/dashboard';
    return '/';
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && loginSuccess) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate, loginSuccess]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !loginSuccess) {
      const dashboardPath = getDashboardPath(user.role);
      navigate(dashboardPath, { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate, loginSuccess]);

  const validate = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = selectedRole === 'STUDENT' ? 'Roll Number is required' : (selectedRole === 'TEACHER' ? 'Employee ID is required' : 'Email is required');
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUserRole = (userData) => {
    const userRole = userData?.role || '';
    const selected = selectedRole.toUpperCase();
    
    const roleMatch = userRole.includes(selected) || 
                     userRole.includes('ROLE_' + selected) ||
                     userRole.replace('ROLE_', '') === selected;
    
    if (!roleMatch) {
      const roleNames = {
        'STUDENT': 'Student',
        'TEACHER': 'Faculty',
        'ADMIN': 'Admin'
      };
      const selectedName = roleNames[selected] || selected;
      toast.error(`You are not registered as a ${selectedName}. Please select your correct role.`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setLoginSuccess(false);
    
    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
        role: selectedRole
      });
      
      if (result.success && result.user) {
        const isValidRole = validateUserRole(result.user);
        
        if (!isValidRole) {
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        
        setLoginSuccess(true);
        const roleName = result.user?.role?.replace('ROLE_', '') || 'User';
        toast.success(`Welcome back, ${result.user?.firstName || roleName}!`);
      } else {
        toast.error(result.message || 'Login failed. Please verify your credentials.');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const getPlaceholder = () => {
    if (selectedRole === 'STUDENT') return 'Enter your roll number (e.g. 23BQ1A1267)';
    if (selectedRole === 'TEACHER') return 'Enter your employee ID';
    return 'Enter your admin email';
  };

  const getFieldLabel = () => {
    if (selectedRole === 'STUDENT') return 'Roll Number';
    if (selectedRole === 'TEACHER') return 'Employee ID';
    return 'Email Address';
  };

  if (authLoading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600 mx-auto" />
          <p className="mt-3 text-sm text-slate-500 font-medium">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
      {/* Background Campus Image with Light Glass Tint */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${campusBg})` }}
      />
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/35 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] border border-white/50 p-7 sm:p-9">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 px-3.5 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm mb-3">
              <img 
                src="/vvit-logo.png" 
                alt="VVIT University Logo" 
                className="h-10 w-auto object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight font-display drop-shadow-md">
              Welcome to VVIT StudyHub
            </h1>
            <p className="text-xs text-blue-100 mt-1 font-semibold drop-shadow-sm">
              Sign in to access your university academic workspace
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-2 drop-shadow-xs">
              Select Portal Role
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('STUDENT');
                  setFormData(prev => ({ ...prev, username: '' }));
                  setErrors({});
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'STUDENT'
                    ? 'bg-white text-[#0f2744] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users size={14} />
                Student
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('TEACHER');
                  setFormData(prev => ({ ...prev, username: '' }));
                  setErrors({});
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'TEACHER'
                    ? 'bg-white text-[#0f2744] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <BookOpen size={14} />
                Faculty
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('ADMIN');
                  setFormData(prev => ({ ...prev, username: '' }));
                  setErrors({});
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedRole === 'ADMIN'
                    ? 'bg-white text-[#0f2744] shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield size={14} />
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Identifier */}
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                {getFieldLabel()} <span className="text-red-300">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                  {selectedRole === 'STUDENT' ? <Hash size={16} /> : selectedRole === 'TEACHER' ? <Briefcase size={16} /> : <Mail size={16} />}
                </div>
                <input
                  type={selectedRole === 'ADMIN' ? 'email' : 'text'}
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder={getPlaceholder()}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                    errors.username ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                  }`}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-200 font-semibold flex items-center gap-1 drop-shadow-sm">
                  <AlertCircle size={12} />
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-white uppercase tracking-wider drop-shadow-xs">
                  Password <span className="text-red-300">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-200 hover:text-white font-bold transition-colors drop-shadow-sm"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                    errors.password ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-200 font-semibold flex items-center gap-1 drop-shadow-sm">
                  <AlertCircle size={12} />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-6 pt-4 border-t border-white/20 text-center">
            <p className="text-xs text-white/90 font-medium drop-shadow-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-200 hover:text-white font-bold underline hover:no-underline">
                Create new account
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;