import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
  User, Mail, Building2, Hash, Briefcase, GraduationCap,
  Calendar, Edit, Save, X, Camera, Loader2,
  AlertCircle, CheckCircle, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateUser, logout, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    departmentId: '',
    rollNumber: '',
    employeeId: '',
    branch: '',
    year: '',
    semester: '',
    joiningYear: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        department: user.department || '',
        departmentId: user.departmentId || '',
        rollNumber: user.rollNumber || '',
        employeeId: user.employeeId || '',
        branch: user.branch || '',
        year: user.year || '',
        semester: user.semester || '',
        joiningYear: user.joiningYear || ''
      });
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateUser(formData);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      department: user.department || '',
      departmentId: user.departmentId || '',
      rollNumber: user.rollNumber || '',
      employeeId: user.employeeId || '',
      branch: user.branch || '',
      year: user.year || '',
      semester: user.semester || '',
      joiningYear: user.joiningYear || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden"
      >
        {/* Profile Hero Header */}
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {user?.role?.replace('ROLE_', '')}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <Edit size={14} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                  >
                    <X size={14} />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Form */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* First Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">{user?.firstName || 'Not set'}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">{user?.lastName || 'Not set'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                <Mail size={15} className="text-slate-400" />
                {user?.email || 'Not set'}
              </p>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Department Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    placeholder="Department Code / ID (optional)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Building2 size={15} className="text-slate-400" />
                  {user?.department || 'Not set'}
                  {user?.departmentId && <span className="text-xs text-slate-400 font-mono">({user.departmentId})</span>}
                </p>
              )}
            </div>

            {/* Role Specific Fields */}
            {user?.role === 'ROLE_STUDENT' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Roll Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="rollNumber"
                      value={formData.rollNumber}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100 font-mono">{user?.rollNumber || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Academic Year & Semester
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                      >
                        <option value="">Year</option>
                        {[1, 2, 3, 4].map(y => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                      >
                        <option value="">Semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                          <option key={s} value={s}>Sem {s}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {user?.joiningYear ? `Batch ${user.joiningYear} • ` : ''}{user?.year ? `Year ${user.year}` : 'Year not set'} • {user?.semester ? `Semester ${user.semester}` : 'Sem not set'}
                    </p>
                  )}
                </div>
              </>
            )}

            {user?.role === 'ROLE_TEACHER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Faculty Employee ID
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100 font-mono">{user?.employeeId || 'Not set'}</p>
                )}
              </div>
            )}

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Account Status
              </label>
              <div className="pt-1">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${user?.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : user?.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                  {user?.status === 'ACTIVE' && <CheckCircle size={13} />}
                  {user?.status === 'PENDING' && <AlertCircle size={13} />}
                  {user?.status === 'REJECTED' && <X size={13} />}
                  {user?.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors"
            >
              <LogOut size={14} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;