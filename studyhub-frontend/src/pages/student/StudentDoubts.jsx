import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  User, 
  BookOpen, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  AlertCircle, 
  Filter, 
  Plus,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  Check,
  UserCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import queryService from '../../services/queryService';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentDoubts = () => {
  const { user, userDepartment } = useAuth();
  
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, replied: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedQueryId, setExpandedQueryId] = useState(null);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Curriculum & Subject list
  const [subjectsList, setSubjectsList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Teacher list for selection
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [selectedTeacherObj, setSelectedTeacherObj] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    subject: '',
    subjectId: '',
    teacherId: '',
    teacherName: '',
    teacherEmail: '',
    title: '',
    queryText: '',
    department: '',
    departmentId: '',
    academicYear: '',
    semester: '',
  });

  useEffect(() => {
    fetchQueries();
    fetchStudentSubjects();
    fetchDepartmentTeachers();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await queryService.getMyQueries();
      const list = res.data || [];
      setQueries(list);
      
      const pending = list.filter(q => q.status === 'PENDING').length;
      const replied = list.filter(q => q.status === 'REPLIED').length;
      const resolved = list.filter(q => q.status === 'RESOLVED').length;
      setStats({
        total: list.length,
        pending,
        replied,
        resolved
      });
    } catch (error) {
      console.error('Failed to fetch student queries:', error);
      toast.error('Failed to load your doubts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const studentDept = userDepartment || user?.department || 'IT';
      const studentYear = user?.year || 1;
      const studentSem = user?.semester || 1;

      // 1. Fetch from curriculum
      const curRes = await api.get(`/curriculum/subjects?department=${studentDept}&academicYear=${studentYear}&semester=${studentSem}`);
      let subjects = curRes.data?.data || curRes.data || [];

      if (!Array.isArray(subjects) || subjects.length === 0) {
        // Fallback to public curriculum endpoint
        const pubRes = await api.get('/curriculum/public');
        const pubData = pubRes.data?.data || pubRes.data || [];
        if (Array.isArray(pubData)) {
          const matched = pubData.find(c => 
            (c.department === studentDept || c.departmentId === studentDept)
          );
          if (matched && matched.subjectNames) {
            subjects = matched.subjectNames.map((name, idx) => ({
              id: matched.subjectIds?.[idx] || `sub-${idx}`,
              subjectName: name,
              name: name
            }));
          }
        }
      }

      // Default common subjects if still empty
      if (!Array.isArray(subjects) || subjects.length === 0) {
        subjects = [
          { id: 'sub-chem', subjectName: 'CHEMISTRY', name: 'CHEMISTRY' },
          { id: 'sub-beee', subjectName: 'BEEE', name: 'BEEE' },
          { id: 'sub-lac', subjectName: 'LA&C', name: 'LA&C' },
          { id: 'sub-cprog', subjectName: 'C PROGRAMMING', name: 'C PROGRAMMING' },
          { id: 'sub-verbal', subjectName: 'VERBAL', name: 'VERBAL' },
          { id: 'sub-eg', subjectName: "ENGINEERING GRAPHIC'S", name: "ENGINEERING GRAPHIC'S" }
        ];
      }

      setSubjectsList(subjects);
    } catch (err) {
      console.error('Failed to load student subjects:', err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchDepartmentTeachers = async (subjectName = '', subjectId = '') => {
    try {
      setLoadingTeachers(true);
      const dept = userDepartment || user?.department || 'IT';
      const deptId = user?.departmentId || dept;
      const studentYear = user?.year ? String(user.year) : '1';
      const studentSem = user?.semester ? String(user.semester) : '1';

      const res = await queryService.getTeachersForSubject({
        subjectName: subjectName || '',
        subjectId: subjectId || '',
        department: dept,
        departmentId: deptId,
        academicYear: studentYear,
        semester: studentSem
      });

      const list = res.data?.availableTeachers || [];
      const assignedTeacher = res.data?.assignedTeacher;

      setAvailableTeachers(list);

      // Auto-assign the teacher matching Student Dept + Subject + Year/Sem
      if (assignedTeacher) {
        setSelectedTeacherObj(assignedTeacher);
        setFormData(prev => ({
          ...prev,
          teacherId: assignedTeacher.id,
          teacherName: assignedTeacher.name,
          teacherEmail: assignedTeacher.email,
        }));
      } else if (list.length > 0 && !formData.teacherId) {
        // Fallback: Pick first available teacher
        const first = list[0];
        setSelectedTeacherObj(first);
        setFormData(prev => ({
          ...prev,
          teacherId: first.id,
          teacherName: first.name,
          teacherEmail: first.email,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleSubjectChange = (e) => {
    const selectedSubName = e.target.value;
    const matchedSubject = subjectsList.find(s => (s.subjectName || s.name || s) === selectedSubName);
    const subId = matchedSubject ? (matchedSubject.id || matchedSubject.subjectId || '') : '';

    const dept = userDepartment || user?.department || 'IT';
    const deptId = user?.departmentId || dept;
    const studentYear = user?.year ? String(user.year) : '1';
    const studentSem = user?.semester || 1;

    setFormData(prev => ({
      ...prev,
      subject: selectedSubName,
      subjectId: subId,
      department: dept,
      departmentId: deptId,
      academicYear: studentYear,
      semester: studentSem,
    }));

    // Update teachers for this exact curriculum (Dept + Subject + Year + Sem)
    if (selectedSubName) {
      fetchDepartmentTeachers(selectedSubName, subId);
    }
  };

  const handleTeacherChange = (e) => {
    const teacherId = e.target.value;
    const teacherObj = availableTeachers.find(t => t.id === teacherId);
    setSelectedTeacherObj(teacherObj || null);

    setFormData(prev => ({
      ...prev,
      teacherId: teacherId,
      teacherName: teacherObj ? teacherObj.name : '',
      teacherEmail: teacherObj ? teacherObj.email : '',
    }));
  };

  const handleOpenModal = () => {
    const dept = userDepartment || user?.department || 'IT';
    const deptId = user?.departmentId || 'IT';
    const studentYear = user?.year ? String(user.year) : '1';
    const studentSem = user?.semester || 1;

    setFormData({
      subject: '',
      subjectId: '',
      teacherId: '',
      teacherName: '',
      teacherEmail: '',
      title: '',
      queryText: '',
      department: dept,
      departmentId: deptId,
      academicYear: studentYear,
      semester: studentSem,
    });
    setSelectedTeacherObj(null);
    fetchDepartmentTeachers();
    setIsModalOpen(true);
  };

  const handleSubmitQuery = async (e) => {
    e.preventDefault();
    if (!formData.subject) {
      toast.error('Please select a subject');
      return;
    }
    if (!formData.teacherId) {
      toast.error('Please select a teacher to send your doubt to');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Please enter a doubt title');
      return;
    }
    if (!formData.queryText.trim()) {
      toast.error('Please describe your doubt in detail');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        studentId: user?.id,
        studentName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Student',
        studentEmail: user?.email,
        studentRollNumber: user?.rollNumber,
      };

      await queryService.createQuery(payload);
      toast.success('Doubt submitted directly to the assigned subject teacher!');
      setIsModalOpen(false);
      fetchQueries();
    } catch (error) {
      console.error('Error submitting doubt:', error);
      toast.error(error.message || 'Failed to submit doubt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkResolved = async (queryId, e) => {
    e.stopPropagation();
    try {
      await queryService.resolveQuery(queryId);
      toast.success('Doubt marked as resolved');
      fetchQueries();
    } catch (error) {
      console.error('Failed to resolve query:', error);
      toast.error('Failed to mark as resolved');
    }
  };

  // Filter queries based on tab and search
  const filteredQueries = queries.filter(q => {
    const matchesTab = activeTab === 'ALL' || q.status === activeTab;
    const matchesSearch = !searchQuery.trim() || 
      (q.title && q.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.subject && q.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.teacherName && q.teacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.queryText && q.queryText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Pending Reply
          </span>
        );
      case 'REPLIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            Teacher Replied
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner - Clean Light Modern Theme */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white rounded-3xl p-6 sm:p-8 border border-blue-100/90 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/80 rounded-full text-xs font-bold text-blue-700 border border-blue-200/60">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Direct Subject Faculty Resolution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2744] tracking-tight">
              Ask Teacher & Doubt Resolution Desk
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Have a question about a lecture or syllabus topic? Select your subject, choose your instructor, and receive direct step-by-step guidance.
            </p>
          </div>

          <button
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Ask New Doubt
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              TOTAL DOUBTS
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {stats.total}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Submitted by you</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              AWAITING FACULTY
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pending}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Pending response</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              REPLIES RECEIVED
            </span>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.replied}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Teacher answered</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              RESOLVED
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {stats.resolved}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Answered & closed</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { key: 'ALL', label: `All Doubts (${stats.total})` },
            { key: 'PENDING', label: `Pending (${stats.pending})` },
            { key: 'REPLIED', label: `Replied (${stats.replied})` },
            { key: 'RESOLVED', label: `Resolved (${stats.resolved})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#0f2744] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search doubts, subjects, teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Doubts List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredQueries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {searchQuery ? 'No matching doubts found' : 'No doubts submitted yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery 
              ? 'Try adjusting your search keywords or clearing filters.' 
              : 'Whenever you have difficulty understanding a topic, select your subject and ask your teacher directly here.'}
          </p>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Ask Your First Doubt
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((item) => {
            const isExpanded = expandedQueryId === item.id;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-100 shadow-sm hover:border-slate-200'
                }`}
              >
                {/* Card Header (Clickable) */}
                <div 
                  onClick={() => setExpandedQueryId(isExpanded ? null : item.id)}
                  className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        <BookOpen className="w-3.5 h-3.5" />
                        {item.subject}
                      </span>
                      {getStatusBadge(item.status)}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        Teacher: <strong className="text-slate-700">{item.teacherName || 'Subject Faculty'}</strong>
                      </span>
                      {item.repliedAt && (
                        <span className="text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Answered
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {item.status !== 'RESOLVED' && item.replyText && (
                      <button
                        onClick={(e) => handleMarkResolved(item.id, e)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Resolved
                      </button>
                    )}

                    <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-5"
                    >
                      {/* Full Doubt Text */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Your Question / Doubt Details
                        </h4>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {item.queryText}
                        </div>
                      </div>

                      {/* Teacher's Reply Box */}
                      {item.replyText ? (
                        <div className="space-y-1.5 bg-blue-50/60 p-5 rounded-2xl border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                {item.repliedByName?.[0] || 'T'}
                              </div>
                              <span className="text-xs font-bold text-slate-900">
                                {item.repliedByName || item.teacherName} (Teacher's Explanation)
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {item.repliedAt ? new Date(item.repliedAt).toLocaleString() : ''}
                            </span>
                          </div>

                          <div className="text-xs text-slate-800 bg-white p-4 rounded-xl border border-blue-100/80 leading-relaxed whitespace-pre-wrap mt-2">
                            {item.replyText}
                          </div>

                          {item.status !== 'RESOLVED' && (
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={(e) => handleMarkResolved(item.id, e)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                I Understood - Mark Doubt as Resolved
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/80 flex items-center gap-3 text-amber-800 text-xs">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            Your doubt has been forwarded directly to <strong>{item.teacherName || 'your selected teacher'}</strong>. You will see their reply here once answered.
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ===== ASK A DOUBT MODAL ===== */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-100"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Ask Subject Teacher a Doubt
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select your subject and choose the faculty member you'd like to ask
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitQuery} className="space-y-4">
                {/* 1. Subject Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    1. Select Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subject}
                    onChange={handleSubjectChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Subject from Curriculum --</option>
                    {subjectsList.map((sub, idx) => {
                      const name = sub.subjectName || sub.name || sub;
                      return (
                        <option key={sub.id || idx} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 2. Choose Teacher (User Selectable Dropdown) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    2. Choose Subject Faculty / Instructor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teacherId}
                    onChange={handleTeacherChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Teacher to Direct Your Doubt --</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        Prof. {t.name} ({t.department || 'Faculty'}{t.isAssigned ? ' • ★ Assigned Subject Faculty' : ''} • {t.email})
                      </option>
                    ))}
                  </select>
                  {availableTeachers.length === 0 && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Loading available faculty instructors...
                    </p>
                  )}
                </div>

                {/* Selected Teacher Preview Card */}
                {selectedTeacherObj && (
                  <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        {selectedTeacherObj.name?.[0] || 'T'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Prof. {selectedTeacherObj.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {selectedTeacherObj.department || 'Faculty'} • {selectedTeacherObj.email}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Selected Faculty
                    </span>
                  </div>
                )}

                {/* 3. Doubt Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    3. Doubt / Topic Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Clarification regarding Thévenin's theorem derivation"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 4. Detailed Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    4. Detailed Description of Doubt <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe what part you found confusing, specific steps, or lecture slides..."
                    value={formData.queryText}
                    onChange={(e) => setFormData(prev => ({ ...prev, queryText: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.subject || !formData.teacherId}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Doubt to Teacher
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDoubts;
