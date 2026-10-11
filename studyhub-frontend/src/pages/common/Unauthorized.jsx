import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center bg-white border border-slate-100 p-8 sm:p-10 rounded-2xl shadow-card"
      >
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Access Denied</h1>
        <p className="text-sm text-slate-600 mb-2 font-medium">
          You don't have authorization to view this resource.
        </p>
        <p className="text-xs text-slate-400 mb-8 leading-relaxed">
          If you believe you should have access to this page, please log in with the appropriate account credentials or contact your university administrator.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;