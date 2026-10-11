import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, Loader2 } from 'lucide-react';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import campusBg from '../../assets/images/college-campus.jpg';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const validate = () => {
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, formData.newPassword);
      setSubmitted(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url(${campusBg})` }}
        />
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-white/35 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] border border-white/50 p-8 max-w-md w-full text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-300/40 rounded-2xl flex items-center justify-center text-emerald-300 shadow-sm backdrop-blur-md">
              <CheckCircle size={32} />
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 mb-3">
            Password Changed
          </span>
          <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md">Password Reset!</h2>
          <p className="text-blue-100 text-sm drop-shadow-sm">Your password has been successfully updated.</p>
          <p className="text-xs text-white font-bold mt-3 drop-shadow-sm flex items-center justify-center gap-1.5">
            <Loader2 className="animate-spin h-3.5 w-3.5" />
            Redirecting to login...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${campusBg})` }}
      />
      <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/35 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] border border-white/50 p-8">
          <div className="mb-6">
            <div className="w-12 h-12 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Set New Password</h1>
            <p className="text-blue-100 text-xs mt-1 font-semibold drop-shadow-sm">
              Choose a strong and secure password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                New Password <span className="text-red-300">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={`w-full pl-10 pr-12 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                    errors.newPassword ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                  }`}
                  placeholder="Minimum 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                Confirm New Password <span className="text-red-300">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                  }`}
                  placeholder="Re-enter password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Resetting password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;