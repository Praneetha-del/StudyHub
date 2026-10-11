import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Briefcase, Calendar, Edit2, Save, 
  X, Camera, GraduationCap, BookOpen 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    year: '',
    semester: '',
    profilePicture: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
        year: user.year || '',
        semester: user.semester || '',
        profilePicture: user.profilePicture || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated successfully');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const isStudent = user?.role === 'ROLE_STUDENT';
  const isTeacher = user?.role === 'ROLE_TEACHER';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50/80 border-b border-slate-100 px-6 sm:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {user?.role?.replace('ROLE_', '') || 'User'}
                  </span>
                </div>
                {isStudent && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {user?.department} • Year {user?.year} • Semester {user?.semester}
                  </p>
                )}
              </div>
            </div>
            <div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                {editMode ? <X size={14} /> : <Edit2 size={14} />}
                <span>{editMode ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>

              <Input
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="bg-slate-100"
              />

              {isStudent && (
                <>
                  <Input
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled
                    className="bg-slate-100"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Year"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      options={[
                        { value: '1', label: '1st Year' },
                        { value: '2', label: '2nd Year' },
                        { value: '3', label: '3rd Year' },
                        { value: '4', label: '4th Year' },
                      ]}
                    />
                    <Select
                      label="Semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      options={[
                        { value: '1', label: 'Semester 1' },
                        { value: '2', label: 'Semester 2' },
                        { value: '3', label: 'Semester 3' },
                        { value: '4', label: 'Semester 4' },
                        { value: '5', label: 'Semester 5' },
                        { value: '6', label: 'Semester 6' },
                        { value: '7', label: 'Semester 7' },
                        { value: '8', label: 'Semester 8' },
                      ]}
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      firstName: user?.firstName || '',
                      lastName: user?.lastName || '',
                      email: user?.email || '',
                      department: user?.department || '',
                      year: user?.year || '',
                      semester: user?.semester || '',
                      profilePicture: user?.profilePicture || '',
                    });
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Profile Information Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">First Name</p>
                  <p className="text-sm font-bold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">{user?.firstName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Name</p>
                  <p className="text-sm font-bold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">{user?.lastName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                  <p className="text-sm font-bold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">{user?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Role</p>
                  <p className="text-sm font-bold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    {user?.role?.replace('ROLE_', '')}
                  </p>
                </div>
                {isStudent && (
                  <>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                      <p className="text-sm font-bold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">{user?.department || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Academic Year & Semester</p>
                      <p className="text-sm font-bold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                        Year {user?.year || '1'} • Semester {user?.semester || '1'}
                      </p>
                    </div>
                  </>
                )}
                {isTeacher && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                    <p className="text-sm font-bold text-slate-900 bg-slate-50/70 p-3 rounded-xl border border-slate-100">{user?.department || '—'}</p>
                  </div>
                )}
              </div>

              {/* Account Stats */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Registration Information</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <p className="text-slate-400">Account Created</p>
                    <p className="font-bold text-slate-800 mt-0.5">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                    <p className="text-slate-400">Account Status</p>
                    <div className="mt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;