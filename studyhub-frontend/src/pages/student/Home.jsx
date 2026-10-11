import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Search, BookOpen, MessageSquare, User, 
  ArrowRight, TrendingUp, Clock, Star,
  GraduationCap, FileText, Video, Users,
  Upload, Shield, LayoutDashboard, Sparkles,
  Layers, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import api from '../../services/api';
import MaterialCard from '../../components/materials/MaterialCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import campusBg from '../../assets/images/college-campus.jpg';

const Home = () => {
  const { user, userDepartment, userDepartmentId, isStudent, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalSubjects: 0,
    totalTeachers: 0,
  });

  const targetDeptId = userDepartmentId || user?.departmentId || '';
  const targetDeptName = userDepartment || user?.department || user?.departmentName || '';

  useEffect(() => {
    fetchDashboardData();
  }, [targetDeptId, targetDeptName]);

  const fetchDashboardData = async () => {
    try {
      // Build departmental URL
      let url = '/materials?size=24&sortBy=createdAt&sortDirection=DESC';
      if (targetDeptId) {
        url += `&departmentId=${encodeURIComponent(targetDeptId)}`;
      } else if (targetDeptName) {
        url += `&departmentId=${encodeURIComponent(targetDeptName)}`;
      }

      // Fetch recent materials
      const materialsRes = await api.get(url);
      const materialsData = materialsRes.data?.data || materialsRes.data || {};
      const materialList = Array.isArray(materialsData) 
        ? materialsData 
        : (materialsData.content || []);

      // Strict departmental filter so CSE users only see CSE materials
      const strictlyDept = materialList.filter(m => {
        if (!targetDeptId && !targetDeptName) return true;
        if (targetDeptId && m.departmentId === targetDeptId) return true;
        if (targetDeptName && (m.department || m.departmentName)) {
          const mNorm = (m.department || m.departmentName || '').toLowerCase().replace('&', 'and').replace(/[^a-z0-9]/g, '');
          const tNorm = targetDeptName.toLowerCase().replace('&', 'and').replace(/[^a-z0-9]/g, '');
          if (mNorm === tNorm || mNorm.includes(tNorm) || tNorm.includes(mNorm)) return true;
        }
        return false;
      }).slice(0, 6);

      setRecentMaterials(strictlyDept);

      // Calculate stats safely for this department
      const totalMaterials = strictlyDept.length;
      const uniqueSubjects = [...new Set(strictlyDept.map(m => m.subject || m.subjectName).filter(Boolean))];
      const uniqueTeachers = [...new Set(strictlyDept.map(m => m.uploadedByName).filter(Boolean))];

      setStats({
        totalMaterials: totalMaterials || 0,
        totalSubjects: uniqueSubjects.length || 0,
        totalTeachers: uniqueTeachers.length || 0,
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setRecentMaterials([]);
      setStats({
        totalMaterials: 0,
        totalSubjects: 0,
        totalTeachers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/materials?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/materials');
    }
  };

  // Role-specific navigation cards
  const getRoleActions = () => {
    if (isAdmin) {
      return [
        {
          title: 'Admin Dashboard',
          description: 'Departmental metrics, analytics & counts',
          icon: LayoutDashboard,
          to: '/admin/dashboard',
          badge: 'Executive',
        },
        {
          title: 'User Management',
          description: 'Approve student & teacher registrations',
          icon: Users,
          to: '/admin/users',
          badge: 'Access Control',
        },
        {
          title: 'Curriculum Builder',
          description: 'Define syllabus, semesters & subjects',
          icon: Layers,
          to: '/admin/curriculum',
          badge: 'Academic Structure',
        },
        {
          title: 'Study Materials',
          description: 'Review and moderate academic uploads',
          icon: BookOpen,
          to: '/admin/materials',
          badge: 'Content Moderation',
        },
      ];
    }

    if (isTeacher) {
      return [
        {
          title: 'Student Queries & Doubts',
          description: 'Resolve subject doubts asked by your students',
          icon: HelpCircle,
          to: '/teacher/queries',
          badge: 'Doubt Desk',
        },
        {
          title: 'Upload Material',
          description: 'Publish lecture notes, syllabus, or YouTube links',
          icon: Upload,
          to: '/upload',
          badge: 'Publish',
        },
        {
          title: 'Teacher Dashboard',
          description: 'Track your uploads, views & student engagements',
          icon: LayoutDashboard,
          to: '/teacher/dashboard',
          badge: 'Analytics',
        },
        {
          title: 'My Published Notes',
          description: 'Manage, edit or delete your uploaded documents',
          icon: FileText,
          to: '/my-materials',
          badge: 'Library',
        },
        {
          title: 'All Materials',
          description: 'Browse all department curriculum resources',
          icon: BookOpen,
          to: '/materials',
          badge: 'Explore',
        },
      ];
    }

    // Default for Students
    return [
      {
        title: 'Ask Teacher / Doubts',
        description: 'Send subject questions directly to your assigned faculty',
        icon: HelpCircle,
        to: '/doubts',
        badge: 'Subject Doubts',
      },
      {
        title: 'Browse Study Materials',
        description: 'Filter notes by batch, semester, year & subject',
        icon: BookOpen,
        to: '/materials',
        badge: 'Library',
      },
      {
        title: 'AI Academic Assistant',
        description: 'Ask questions, clarify concepts & summarize notes',
        icon: MessageSquare,
        to: '/chatbot',
        badge: '24/7 AI Tutor',
      },
      {
        title: 'My Academic Profile',
        description: 'View enrollment details, branch & semester info',
        icon: User,
        to: '/profile',
        badge: 'Account',
      },
    ];
  };

  const roleActions = getRoleActions();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ===== COLLEGE CAMPUS HERO SECTION ===== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-950 min-h-[360px] sm:min-h-[400px] flex flex-col justify-end"
      >
        {/* Background College Image - Crystal Clear 4K */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${campusBg})` }}
        />
        {/* Directional Soft Left-Only Dark Gradient for high text contrast while keeping building 100% sharp & visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent sm:hidden" />

        {/* Content Container */}
        <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-12 text-white">
          <div className="max-w-2xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/70 text-blue-200 border border-white/20 backdrop-blur-md mb-3.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>
                {isAdmin ? 'University Administrative Hub' : isTeacher ? 'Faculty Portal & Resource Center' : 'Digital Learning & Academic Portal'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
              Welcome back, <span className="text-blue-300">{user?.firstName || 'Scholar'}</span> 👋
            </h1>

            {/* Subtitle */}
            <p className="text-slate-100 text-sm sm:text-base mt-2 max-w-xl leading-relaxed drop-shadow-sm font-medium">
              {isAdmin 
                ? 'Manage curriculum structures, oversee departmental resources, and review university user accounts.' 
                : isTeacher 
                ? 'Empower students with curated lecture notes, presentation slides, syllabus modules, and video links.' 
                : 'Access verified departmental lecture notes, previous papers, curriculum roadmaps, and instant AI study support.'
              }
            </p>
          </div>

          {/* Quick Stats Grid Overlaid on Campus Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4 mt-6 pt-5 border-t border-white/20 max-w-3xl">
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{stats.totalMaterials}</p>
                <p className="text-xs text-slate-200 font-medium">Materials Published</p>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{stats.totalSubjects}</p>
                <p className="text-xs text-slate-200 font-medium">Subjects Available</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-900/60 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 sm:p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-10 h-10 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-300 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-extrabold text-white leading-tight">{stats.totalTeachers}</p>
                <p className="text-xs text-slate-200 font-medium">Active Contributors</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== ROLE-BASED QUICK ACTIONS ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Quick Actions & Portals</h2>
            <p className="text-xs text-slate-500">Shortcuts tailored for your {user?.role ? user.role.replace('ROLE_', '').toLowerCase() : 'user'} role</p>
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(roleActions.length, 4)} gap-4`}>
          {roleActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link
                to={action.to}
                className="group block bg-white rounded-2xl border border-slate-100 p-5 shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                      <action.icon className="w-5 h-5" />
                    </div>
                    {action.badge && (
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>Open Portal</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ===== RECENT MATERIALS SECTION ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Recently Added Study Materials</h2>
            <p className="text-xs text-slate-500">Latest academic resources published by verified faculty members</p>
          </div>
          <Link
            to="/materials"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 group bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
          >
            <span>View All Materials</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {recentMaterials.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-card">
            <EmptyState
              title="No materials available yet"
              description="New study materials uploaded by faculty will appear here."
              icon={<BookOpen size={40} className="text-slate-300 mx-auto mb-2" />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentMaterials.map((material, index) => (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MaterialCard material={material} onUpdate={fetchDashboardData} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;