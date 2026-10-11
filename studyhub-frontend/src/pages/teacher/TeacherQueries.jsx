import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  User, 
  BookOpen, 
  Send, 
  Search, 
  Filter, 
  Building2, 
  Sparkles, 
  GraduationCap, 
  Check, 
  X, 
  RefreshCw,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import queryService from '../../services/queryService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TeacherQueries = () => {
  const { user, userDepartment } = useAuth();
  
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, replied: 0, resolved: 0 });

  // Reply Modal State
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [markResolved, setMarkResolved] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    try {
      setLoading(true);
      const res = await queryService.getTeacherQueries();
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
      console.error('Failed to fetch teacher queries:', error);
      toast.error('Failed to load student queries');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReplyModal = (query) => {
    setSelectedQuery(query);
    setReplyText(query.replyText || '');
    setMarkResolved(query.status === 'RESOLVED');
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Please enter your reply explanation');
      return;
    }

    try {
      setSubmittingReply(true);
      await queryService.replyToQuery(selectedQuery.id, {
        replyText: replyText.trim(),
        resolve: markResolved,
        status: markResolved ? 'RESOLVED' : 'REPLIED'
      });

      toast.success(markResolved ? 'Reply sent & doubt marked as resolved!' : 'Reply sent to student!');
      setSelectedQuery(null);
      setReplyText('');
      fetchQueries();
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error(error.message || 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDirectResolve = async (queryId, e) => {
    e.stopPropagation();
    try {
      await queryService.resolveQuery(queryId);
      toast.success('Query marked as resolved');
      fetchQueries();
    } catch (error) {
      console.error('Failed to resolve query:', error);
      toast.error('Failed to update status');
    }
  };

  // Filter queries
  const filteredQueries = queries.filter(q => {
    const matchesTab = activeTab === 'ALL' || q.status === activeTab;
    const matchesSearch = !searchQuery.trim() ||
      (q.title && q.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.subject && q.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.studentName && q.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.studentRollNumber && q.studentRollNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.queryText && q.queryText.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Needs Reply
          </span>
        );
      case 'REPLIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            Replied
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
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>{userDepartment || user?.department || 'IT'} Faculty Doubt Resolution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f2744] tracking-tight">
              Student Subject Queries & Doubts
            </h1>
            <p className="text-slate-600 text-sm leading-relaxed">
              Review and answer questions submitted by enrolled students for your curriculum subjects. Provide solutions and mark issues resolved.
            </p>
          </div>

          <button
            onClick={fetchQueries}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs border border-slate-200 shadow-xs hover:shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
            Refresh Queries
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              ASSIGNED QUERIES
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {stats.total}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">For your subjects</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              PENDING RESPONSE
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pending}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Awaiting faculty reply</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              REPLIED
            </span>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.replied}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Answer provided</p>
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
            <p className="text-xs text-slate-400 mt-0.5">Clarified & closed</p>
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
            { key: 'ALL', label: `All Queries (${stats.total})` },
            { key: 'PENDING', label: `Pending Attention (${stats.pending})` },
            { key: 'REPLIED', label: `Replied (${stats.replied})` },
            { key: 'RESOLVED', label: `Resolved (${stats.resolved})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student, roll number, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Queries List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredQueries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {searchQuery ? 'No matching student queries found' : 'No queries currently pending'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? 'Try modifying your search keywords.'
              : 'All student queries for your assigned subjects have been answered.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== 'RESOLVED' && (
                    <button
                      onClick={(e) => handleDirectResolve(item.id, e)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Resolved
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenReplyModal(item)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {item.replyText ? 'Edit Reply' : 'Answer Doubt'}
                  </button>
                </div>
              </div>

              {/* Doubt Title & Description */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  {item.title}
                </h3>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {item.queryText}
                </div>
              </div>

              {/* Student Metadata Card */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50/60 px-4 py-2.5 rounded-xl border border-slate-100/80 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#0f2744] text-white flex items-center justify-center font-bold text-[10px]">
                    {item.studentName?.[0] || 'S'}
                  </div>
                  <span className="font-semibold text-slate-800">
                    {item.studentName}
                  </span>
                  {item.studentRollNumber && (
                    <span className="text-slate-400">
                      • Roll: <strong>{item.studentRollNumber}</strong>
                    </span>
                  )}
                  <span className="text-slate-400">
                    • {item.studentEmail}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400">
                  {item.department || 'IT'} • Year {item.academicYear || '1'} (Sem {item.semester || '1'})
                </div>
              </div>

              {/* If already replied, display teacher reply */}
              {item.replyText && (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-blue-900 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      Your Faculty Response:
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {item.repliedAt ? new Date(item.repliedAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <div className="text-slate-800 bg-white p-3 rounded-lg border border-blue-100 whitespace-pre-wrap">
                    {item.replyText}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ===== REPLY MODAL ===== */}
      <AnimatePresence>
        {selectedQuery && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Answer Student Doubt
                    </h2>
                    <p className="text-xs text-slate-500">
                      Subject: <strong className="text-blue-600">{selectedQuery.subject}</strong> • Student: {selectedQuery.studentName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuery(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Student Query Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-slate-700">{selectedQuery.studentName} ({selectedQuery.studentRollNumber || 'Student'})</span>
                  <span>{new Date(selectedQuery.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {selectedQuery.title}
                </h4>
                <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {selectedQuery.queryText}
                </p>
              </div>

              {/* Faculty Reply Form */}
              <form onSubmit={handleSubmitReply} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Faculty Explanation / Solution <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Provide a clear, detailed explanation or resolution to help the student understand..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Mark as Resolved checkbox */}
                <div className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                  <input
                    type="checkbox"
                    id="markResolved"
                    checked={markResolved}
                    onChange={(e) => setMarkResolved(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="markResolved" className="text-xs font-semibold text-emerald-900 cursor-pointer">
                    Mark this doubt as fully <strong>RESOLVED</strong>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedQuery(null)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  >
                    {submittingReply ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Response to Student
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

export default TeacherQueries;
