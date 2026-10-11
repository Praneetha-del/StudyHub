import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, UserCheck, UserX, UserPlus,
  Mail, Phone, Calendar, Shield, Building2, Hash,
  Loader2, CheckCircle, XCircle, Clock, MoreVertical,
  Edit, Trash2, Eye, RefreshCw, UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { user: currentUser, userDepartment, userDepartmentId } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // ✅ Get admin's department
  const adminDepartment = userDepartment || currentUser?.department || '';
  const adminDepartmentId = userDepartmentId || currentUser?.departmentId || '';

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole, selectedStatus, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // ✅ IMPORTANT: Filter by admin's department
      const params = {
        page: currentPage,
        size: pageSize,
        role: selectedRole !== 'All' ? selectedRole : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        search: searchTerm || undefined,
        department: adminDepartment || adminDepartmentId  // ✅ Only this department
      };

      console.log('📥 Fetching users for department:', adminDepartment);
      console.log('📥 Params:', params);
      
      const response = await adminService.getAllUsers(params);
      console.log('📥 Users response:', response);

      if (response && response.success) {
        const data = response.data;
        if (Array.isArray(data)) {
          // ✅ Filter by department if API doesn't support department filter
          const filteredUsers = data.filter(user => 
            user.department?.toLowerCase() === adminDepartment?.toLowerCase() ||
            user.departmentId === adminDepartmentId
          );
          setUsers(filteredUsers);
          setTotalUsers(filteredUsers.length);
          setTotalPages(1);
        } else if (data && data.content) {
          // ✅ Filter by department
          const filteredContent = data.content.filter(user => 
            user.department?.toLowerCase() === adminDepartment?.toLowerCase() ||
            user.departmentId === adminDepartmentId
          );
          setUsers(filteredContent);
          setTotalUsers(data.totalElements || filteredContent.length);
          setTotalPages(data.totalPages || 1);
        } else {
          setUsers([]);
          setTotalUsers(0);
          setTotalPages(0);
        }
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(0);
        if (response && response.message) {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this user?')) return;
    try {
      const response = await adminService.approveUser(userId);
      if (response.success) {
        toast.success('User approved successfully');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to approve user');
      }
    } catch (error) {
      console.error('❌ Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      const response = await adminService.rejectUser(userId, reason || 'No reason provided');
      if (response.success) {
        toast.success('User rejected');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to reject user');
      }
    } catch (error) {
      console.error('❌ Error rejecting user:', error);
      toast.error('Failed to reject user');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const response = await adminService.deleteUser(userId);
      if (response.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };


  const getRoleBadge = (role) => {
    const roleMap = {
      'ROLE_ADMIN': 'bg-purple-50 text-purple-700 border-purple-200',
      'ROLE_TEACHER': 'bg-blue-50 text-blue-700 border-blue-200',
      'ROLE_STUDENT': 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    const roleName = role?.replace('ROLE_', '') || 'Unknown';
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleMap[role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {roleName}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'ACTIVE': { icon: CheckCircle, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
      'PENDING': { icon: Clock, color: 'text-amber-700 bg-amber-50 border-amber-200' },
      'REJECTED': { icon: XCircle, color: 'text-red-700 bg-red-50 border-red-200' },
      'INACTIVE': { icon: UserX, color: 'text-slate-600 bg-slate-100 border-slate-200' }
    };
    const statusInfo = statusMap[status] || statusMap['INACTIVE'];
    const Icon = statusInfo.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
        <Icon size={12} />
        {status || 'Unknown'}
      </span>
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRole('All');
    setSelectedStatus('All');
    setCurrentPage(0);
  };

  // Filter users by admin's department
  const filteredUsers = users.filter(user => {
    const userDept = user.department || '';
    const isSameDepartment = userDept.toLowerCase() === adminDepartment?.toLowerCase() ||
                             user.departmentId === adminDepartmentId;
    
    if (!isSameDepartment) return false;

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const match = fullName.includes(search) || 
                   user.email?.toLowerCase().includes(search) ||
                   user.rollNumber?.toLowerCase().includes(search) ||
                   user.employeeId?.toLowerCase().includes(search);
      if (!match) return false;
    }

    if (selectedRole !== 'All' && user.role !== selectedRole) {
      return false;
    }

    if (selectedStatus !== 'All' && user.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-medium text-slate-500">Loading department user directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
            <span>Access Control & Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Authorize new faculty and student registrations, revoke access, and manage accounts for <strong className="text-slate-800">{adminDepartment || 'department'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Refresh Directory"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3.5 py-2 rounded-xl text-xs font-semibold">
            {totalUsers} Member{totalUsers !== 1 ? 's' : ''} Enrolled
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, roll number, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            >
              <option value="All">All Roles</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_TEACHER">Teacher / Faculty</option>
              <option value="ROLE_STUDENT">Student</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            >
              <option value="All">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">Active:</span>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg flex items-center gap-1 font-semibold">
            <Building2 size={12} />
            {adminDepartment || 'All'}
          </span>
          {selectedRole !== 'All' && (
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg flex items-center gap-1 font-semibold border border-blue-100">
              Role: {selectedRole.replace('ROLE_', '')}
              <button onClick={() => setSelectedRole('All')} className="hover:text-blue-900 ml-1">×</button>
            </span>
          )}
          {selectedStatus !== 'All' && (
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-1 font-semibold border border-emerald-100">
              Status: {selectedStatus}
              <button onClick={() => setSelectedStatus('All')} className="hover:text-emerald-900 ml-1">×</button>
            </span>
          )}
          {(searchTerm || selectedRole !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Users size={22} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">No Users Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || selectedRole !== 'All' || selectedStatus !== 'All'
                ? 'No matching users found for current filter criteria.'
                : `There are no accounts registered under the ${adminDepartment || 'selected'} department.`
              }
            </p>
            {(searchTerm || selectedRole !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={resetFilters}
                className="mt-4 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/70 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Identifier</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shadow-sm flex-shrink-0">
                          {u.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-semibold text-slate-700">
                      {u.department || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-slate-600">
                      <div>{u.rollNumber || u.employeeId || '—'}</div>
                      {u.joiningYear && <div className="text-[10px] text-slate-400 font-sans">Batch {u.joiningYear}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      {getStatusBadge(u.status)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve Button */}
                        {u.status === 'PENDING' && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve User Registration"
                          >
                            <CheckCircle size={17} />
                          </button>
                        )}
                        
                        {/* Reject Button */}
                        {u.status === 'PENDING' && (
                          <button
                            onClick={() => handleReject(u.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject Registration"
                          >
                            <XCircle size={17} />
                          </button>
                        )}
                        
                        {/* Delete Button */}
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="text-slate-500 font-medium">
              Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalUsers)} of {totalUsers}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 shadow-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;