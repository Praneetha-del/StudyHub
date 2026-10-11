import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  BookOpen, 
  Eye, 
  Download, 
  Building2,
  ArrowUpRight,
  Plus,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import materialService from '../../services/materialService';
import queryService from '../../services/queryService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeacherDashboard = () => {
  const { user, userDepartment } = useAuth();
  const [stats, setStats] = useState({
    totalMaterials: 0,
    activeMaterials: 0,
    totalViews: 0,
    totalDownloads: 0,
    pendingQueries: 0,
    totalQueries: 0,
  });
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await materialService.getMyMaterials({ size: 10, sortBy: 'createdAt' });
      let materials = [];
      let total = 0;
      if (response && response.data) {
        materials = response.data.content || (Array.isArray(response.data) ? response.data : []);
        total = response.data.totalElements || materials.length;
      }
      
      setRecentMaterials(materials);

      // Fetch teacher query counts
      let pendingQueries = 0;
      let totalQueries = 0;
      try {
        const queryRes = await queryService.getTeacherQueries();
        const queriesList = queryRes.data || [];
        totalQueries = queriesList.length;
        pendingQueries = queriesList.filter(q => q.status === 'PENDING').length;
      } catch (qErr) {
        console.error('Failed to load query count:', qErr);
      }

      setStats({
        totalMaterials: total || materials.length,
        activeMaterials: materials.filter(m => (m.status || 'ACTIVE') === 'ACTIVE').length || materials.length,
        totalViews: materials.reduce((sum, m) => sum + (m.views || 0), 0),
        totalDownloads: materials.reduce((sum, m) => sum + (m.downloads || 0), 0),
        pendingQueries,
        totalQueries,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const departmentDisplay = userDepartment || user?.department || 'IT';

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Department Badge & Header Row */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold mb-3">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span>{departmentDisplay} Department</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Faculty Instructor Workspace
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Welcome back, Prof. {user?.firstName} {user?.lastName}. Upload coursework, curate lectures, and manage student learning notes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/teacher/queries"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl font-medium text-sm transition-all"
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              Student Doubts
              {stats.pendingQueries > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  {stats.pendingQueries}
                </span>
              )}
            </Link>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Upload New Material
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Uploaded Materials */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              UPLOADED MATERIALS
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalMaterials}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Your total published notes
            </p>
          </div>
          <div className="p-3 bg-blue-50/80 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Active (Live) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              ACTIVE (LIVE)
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {stats.activeMaterials}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Available to students
            </p>
          </div>
          <div className="p-3 bg-blue-50/80 text-blue-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Student Doubts Pending */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              STUDENT DOUBTS
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pendingQueries} Pending
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats.totalQueries} total asked
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Material Views */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              MATERIAL VIEWS
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalViews}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Classroom reader views
            </p>
          </div>
          <div className="p-3 bg-blue-50/80 text-blue-600 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3 Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/teacher/queries"
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
            Student Doubt Resolution
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Answer questions and clear subject concepts asked by enrolled students.
          </p>
        </Link>

        <Link
          to="/upload"
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-blue-50/80 text-blue-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
            Publish Study Material
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Upload PDF lecture notes, presentation slides, question banks, or YouTube lecture links.
          </p>
        </Link>

        <Link
          to="/my-materials"
          className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="p-2.5 bg-blue-50/80 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-4 group-hover:text-blue-600 transition-colors">
            Manage Published Resources
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Edit subject tags, update attachments, or view feedback on your published files.
          </p>
        </Link>
      </div>

      {/* Recent Uploads Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Your Recent Uploads</h2>
          <Link
            to="/my-materials"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
          >
            View All Uploads
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentMaterials.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No recent uploads found. Click "Upload New Material" to add your first lecture note.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentMaterials.slice(0, 5).map((material, index) => (
              <motion.div
                key={material.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2.5 bg-blue-50/80 text-blue-600 rounded-xl shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {material.title || 'Untitled Material'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {material.subjectName || material.subject || 'General'} • Year {material.academicYear || material.year || '4'} • Sem {material.semester || '7'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-600 border border-emerald-100/80">
                    {material.status || 'ACTIVE'}
                  </span>
                  <Link
                    to={`/materials/${material.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    View
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;