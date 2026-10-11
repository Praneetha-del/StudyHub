import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Building2, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Save,
  X,
  Loader2,
  UserCircle,
  Key,
  Shield,
  Clock,
  IdCard,
  Smartphone,
  Globe,
  MapPin
} from 'lucide-react';
import Button from '../../components/common/Button';

const AdminProfile = () => {
  const { user, setUser, token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    departmentId: '',
    role: '',
    status: '',
    branch: '',
    year: '',
    semester: '',
    phone: '',
    address: ''
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || '',
        departmentId: user.departmentId || '',
        role: user.role || '',
        status: user.status || '',
        branch: user.branch || '',
        year: user.year || '',
        semester: user.semester || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await userService.updateProfile(formData);
      if (response.success) {
        // Update user context with new data
        setUser(prev => ({ ...prev, ...formData }));
        toast.success('Profile updated successfully!');
        setEditing(false);
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Please enter current password');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.success) {
        toast.success('Password changed successfully!');
        setChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(response.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get role badge color
  const getRoleColor = (role) => {
    if (role === 'ROLE_ADMIN') return 'bg-purple-100 text-purple-700 border-purple-200';
    if (role === 'ROLE_TEACHER') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (role === 'ROLE_STUDENT') return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get role display name
  const getRoleDisplay = (role) => {
    if (!role) return 'Unknown';
    return role.replace('ROLE_', '');
  };

  // Get status color
  const getStatusColor = (status) => {
    if (status === 'ACTIVE') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (status === 'REJECTED') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (status === 'ACTIVE') return <CheckCircle className="w-4 h-4" />;
    if (status === 'PENDING') return <Clock className="w-4 h-4" />;
    if (status === 'REJECTED') return <AlertCircle className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-slate-100">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-navy via-slate-900 to-navy-dark px-6 sm:px-8 py-8 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner">
                  <UserCircle className="w-12 h-12" />
                </div>
                <div className="absolute -bottom-1 -right-1">
                  <div className={`w-4 h-4 rounded-full border-2 border-slate-900 ${
                    user?.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-sm text-slate-300 font-mono mt-0.5">{user?.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    <Shield className="w-3.5 h-3.5 text-blue-300" />
                    {getRoleDisplay(user?.role)}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle className="w-3 h-3" />
                    {user?.status || 'Active'}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Joined {formatDate(user?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            {!editing && (
              <button 
                onClick={() => setEditing(true)} 
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors self-start sm:self-auto"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {/* Editing Controls */}
          {editing && (
            <div className="flex justify-end gap-3 mb-6 pb-4 border-b border-slate-100">
              <button 
                onClick={() => {
                  setEditing(false);
                  if (user) {
                    setFormData({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                      department: user.department || '',
                      departmentId: user.departmentId || '',
                      role: user.role || '',
                      status: user.status || '',
                      branch: user.branch || '',
                      year: user.year || '',
                      semester: user.semester || '',
                      phone: user.phone || '',
                      address: user.address || ''
                    });
                  }
                }} 
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile} 
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}

          {/* Profile Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                First Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-800">{user?.firstName || 'Not set'}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                Last Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-800">{user?.lastName || 'Not set'}</p>
              )}
            </div>

            {/* Email */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                Email Address
              </label>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">{user?.email || 'Not set'}</p>
                {user?.email && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Role */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                System Role
              </label>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {getRoleDisplay(user?.role)}
              </span>
            </div>

            {/* Department */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Department
              </label>
              {editing ? (
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={user?.role === 'ROLE_ADMIN'}
                />
              ) : (
                <p className="text-sm font-semibold text-slate-800">{user?.department || 'Not set'}</p>
              )}
            </div>

            {/* Department ID */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <IdCard className="w-3.5 h-3.5 text-blue-600" />
                Department ID
              </label>
              <p className={`text-sm font-semibold ${user?.departmentId ? 'text-slate-800' : 'text-amber-600'}`}>
                {user?.departmentId || (
                  <span className="flex items-center gap-1 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    Not configured
                  </span>
                )}
              </p>
            </div>

            {/* Branch */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Branch / Specialization
              </label>
              {editing ? (
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-800">{user?.branch || 'Not set'}</p>
              )}
            </div>

            {/* Phone */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                Phone Number
              </label>
              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter phone number"
                />
              ) : (
                <p className="text-sm font-semibold text-slate-800">{user?.phone || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  Security & Password
                </h3>
                <p className="text-xs text-slate-500">Update your account credentials to keep your administrator access secure</p>
              </div>
              <button 
                onClick={() => setChangingPassword(!changingPassword)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  changingPassword 
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {changingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {changingPassword && (
              <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Account Metadata */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Account Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Member Since</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Last Active</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">{formatDateTime(user?.updatedAt)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">User ID</span>
                <span className="font-mono text-slate-700 truncate mt-0.5 block" title={user?.id}>
                  {user?.id || 'N/A'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block">Authorization</span>
                <span className="font-semibold text-blue-600 mt-0.5 block">{user?.role || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;