import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import campusBg from '../../assets/images/college-campus.jpg';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      console.error('Forgot password error:', error);
      const message = error.response?.data?.message || 'Failed to send reset link';
      toast.error(message);
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
            Email Dispatched
          </span>
          <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md">Check Your Email</h2>
          <p className="text-blue-100 text-sm drop-shadow-sm">
            We've sent a password reset link to <strong className="text-white font-bold">{email}</strong>
          </p>
          <p className="text-xs text-slate-200 mt-3 drop-shadow-sm">
            If you don't see it within a few moments, check your spam or junk folder.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full mt-6 py-3 bg-white text-[#0f2744] hover:bg-slate-100 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            Back to Login
          </Link>
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
          <Link to="/login" className="inline-flex items-center text-xs font-bold text-blue-200 hover:text-white mb-6 transition-colors drop-shadow-sm">
            <ArrowLeft size={16} className="mr-1.5" />
            Back to Login
          </Link>

          <div className="mb-6">
            <div className="w-12 h-12 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
              <Mail size={22} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Reset Password</h1>
            <p className="text-blue-100 text-xs mt-1 font-semibold drop-shadow-sm">
              Enter your registered email address and we'll send you a link to reset your account password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                Email Address <span className="text-red-300">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-600" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border border-white/60 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner"
                  placeholder="name@university.edu"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Sending link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;