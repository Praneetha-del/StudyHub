import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Sparkles, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-100 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F2744] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                S
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">StudyHub</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Autonomous Academic Content & AI Assistant Platform for Higher Education.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit border border-emerald-100">
              <ShieldCheck size={14} />
              <span>Role-Based Access Control Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Resources</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/materials" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Study Materials
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1">
                  <Sparkles size={12} className="text-blue-600" />
                  AI Academic Assistant
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* For Teachers */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Faculty Portal</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/upload" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Upload Curriculum Material
                </Link>
              </li>
              <li>
                <Link to="/my-materials" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Manage My Resources
                </Link>
              </li>
              <li>
                <Link to="/teacher/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Faculty Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Department Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Institutional Help</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Need technical support or curriculum assistance? Contact your department coordinator.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
              <Mail size={13} />
              <span>support@studyhub.edu</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>&copy; {currentYear} StudyHub Academic Management. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">Academic Guidelines</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">System Status</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;