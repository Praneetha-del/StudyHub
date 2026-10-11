import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, UserCheck, UserX, 
  FileText, Video, Clock, TrendingUp,
  RefreshCw, AlertCircle
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const { user, userDepartment, userDepartmentId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    pendingTeachers: 0,
    totalMaterials: 0,
    activeMaterials: 0,
    blockedMaterials: 0,
  });
  const [recentMaterials, setRecentMaterials] = useState([]);

  const adminDepartment = userDepartment || user?.department || user?.departmentName || '';
  const adminDepartmentId = userDepartmentId || user?.departmentId || '';

  useEffect(() => {
    fetchDashboardData();
  }, [adminDepartment, adminDepartmentId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch departmental stats
      const statsResponse = await adminService.getStats({
        department: adminDepartment || undefined,
        departmentId: adminDepartmentId || undefined,
      });
      if (statsResponse && statsResponse.success) {
        setStats(statsResponse.data || {
          totalUsers: 0,
          totalStudents: 0,
          totalTeachers: 0,
          totalAdmins: 0,
          pendingTeachers: 0,
          totalMaterials: 0,
          activeMaterials: 0,
          blockedMaterials: 0,
        });
      } else {
        // ✅ If no stats, keep zeros
        setStats({
          totalUsers: 0,
          totalStudents: 0,
          totalTeachers: 0,
          totalAdmins: 0,
          pendingTeachers: 0,
          totalMaterials: 0,
          activeMaterials: 0,
          blockedMaterials: 0,
        });
      }

      // Fetch recent materials filtered by admin department
      try {
        const materialsResponse = await adminService.getAllMaterials({
          page: 0,
          size: 10,
          department: adminDepartment || undefined,
          departmentId: adminDepartmentId || undefined,
        });
        if (materialsResponse && materialsResponse.success) {
          const data = materialsResponse.data;
          const list = data.content || [];
          
          // Strict departmental filter
          const strictlyDept = list.filter(m => {
            if (!adminDepartment && !adminDepartmentId) return true;
            if (adminDepartmentId && m.departmentId === adminDepartmentId) return true;
            if (adminDepartment && (m.department || m.departmentName)) {
              const mNorm = (m.department || m.departmentName || '').toLowerCase().replace('&', 'and').replace(/[^a-z0-9]/g, '');
              const aNorm = adminDepartment.toLowerCase().replace('&', 'and').replace(/[^a-z0-9]/g, '');
              if (mNorm === aNorm || mNorm.includes(aNorm) || aNorm.includes(mNorm)) return true;
            }
            return false;
          }).slice(0, 5);

          setRecentMaterials(strictlyDept);
        } else {
          setRecentMaterials([]);
        }
      } catch (error) {
        // ✅ Silent fail - just set empty array
        setRecentMaterials([]);
      }

    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      setStats({
        totalUsers: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalAdmins: 0,
        pendingTeachers: 0,
        totalMaterials: 0,
        activeMaterials: 0,
        blockedMaterials: 0,
      });
      setRecentMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Materials',
      value: stats.totalMaterials,
      icon: BookOpen,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Teachers',
      value: stats.totalTeachers,
      icon: UserCheck,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
            <span>Executive Administration Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Departmental statistics, access requests, curriculum data, and recent activity for <strong className="text-slate-800">{adminDepartment ? `${adminDepartment} Department` : 'Department'}</strong>
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all w-fit cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all p-5 sm:p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight mt-1">{card.value}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                <card.icon size={22} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Materials • {adminDepartment || 'Department'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Real-time uploads submitted across all semesters</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            {recentMaterials.length} Latest Entries
          </span>
        </div>

        {recentMaterials.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FileText size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-700">No recent materials uploaded</p>
            <p className="text-xs text-slate-400 mt-1">Uploaded notes and lecture files will be listed here.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentMaterials.map((material, index) => (
              <motion.div
                key={material.id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/80 rounded-xl border border-slate-100 transition-all gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
                    {material.type === 'VIDEO' || material.type === 'YOUTUBE' ? (
                      <Video size={16} className="text-red-500" />
                    ) : (
                      <FileText size={16} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">{material.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {material.subject || material.subjectName || 'General'} • Year {material.academicYear || material.year || '1'} • Sem {material.semester || '1'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {material.status === 'ACTIVE' ? (
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-semibold">
                      Blocked
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-medium">
                    {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;