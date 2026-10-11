import React from 'react';
import { motion } from 'framer-motion';

const AdminStatsCard = ({ title, value, icon: Icon, color, trend }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 hover:shadow-card-hover transition-all"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 mt-1.5">{value || 0}</p>
          {trend && (
            <p className={`text-xs mt-1.5 font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colors[color] || colors.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

export default AdminStatsCard;