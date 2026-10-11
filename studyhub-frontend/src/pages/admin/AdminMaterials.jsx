import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, EyeOff, Trash2, Download, RefreshCw, FileText, Video, File, AlertCircle } from 'lucide-react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';

const AdminMaterials = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [actionType, setActionType] = useState('');

  const adminDepartment = user?.department || user?.departmentName || '';
  const adminDepartmentId = user?.departmentId || '';

  useEffect(() => {
    fetchMaterials();
  }, [currentPage, filters, adminDepartment, adminDepartmentId]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllMaterials({
        page: currentPage,
        size: 10,
        department: adminDepartment || undefined,
        departmentId: adminDepartmentId || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
      });
      
      if (response.success) {
        const data = response.data;
        const list = data.content || [];
        // Filter strictly for admin's department if adminDepartment is known
        const strictlyDept = list.filter(m => {
          if (!adminDepartment && !adminDepartmentId) return true;
          if (adminDepartmentId && m.departmentId === adminDepartmentId) return true;
          if (adminDepartment && (m.department || m.departmentName)) {
            const mNorm = (m.department || m.departmentName || '').toLowerCase().replace('&', 'and').replace(/[^a-z0-9]/g, '');
            const aNorm = adminDepartment.toLowerCase().replace('&', 'and').replace(/[^a-z0-9]/g, '');
            if (mNorm === aNorm || mNorm.includes(aNorm) || aNorm.includes(mNorm)) return true;
          }
          return false;
        });

        setMaterials(strictlyDept);
        setTotalElements(strictlyDept.length);
        setTotalPages(Math.ceil(strictlyDept.length / 10) || 1);
      } else {
        setMaterials([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('❌ fetchMaterials error:', error);
      setMaterials([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockMaterial = async (id, reason) => {
    try {
      await adminService.blockMaterial(id, reason);
      toast.success('Material blocked successfully');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to block material');
    }
    setShowDeleteDialog(false);
    setSelectedMaterial(null);
  };

  const handleUnblockMaterial = async (id) => {
    try {
      await adminService.unblockMaterial(id);
      toast.success('Material unblocked successfully');
      fetchMaterials();
    } catch (error) {
      toast.error('Failed to unblock material');
    }
    setShowDeleteDialog(false);
    setSelectedMaterial(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchMaterials();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setCurrentPage(0);
  };

  const getTypeIcon = (type) => {
    if (type === 'VIDEO') return <Video size={16} className="text-red-500" />;
    if (type === 'PDF') return <FileText size={16} className="text-blue-500" />;
    return <File size={16} className="text-gray-500" />;
  };

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>;
    } else if (status === 'BLOCKED') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Blocked</span>;
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">{status}</span>;
  };

  if (loading && materials.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
            <span>Curriculum Moderation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Material Moderation</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Monitor, review quality, block inappropriate uploads, and audit study resources for <strong className="text-slate-800">{adminDepartment}</strong>
          </p>
        </div>
        <button
          onClick={fetchMaterials}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all w-fit"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title, subject, or author..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            />
          </div>
          <div className="w-full sm:w-44">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="BLOCKED">Blocked Only</option>
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Search size={15} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Materials List */}
      {materials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-14 text-center">
          <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <FileText size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">No Materials Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no materials uploaded for <strong>{adminDepartment}</strong> matching your criteria.
          </p>
          {(filters.search || filters.status) && (
            <button
              onClick={() => {
                setFilters({ status: '', search: '' });
                setCurrentPage(0);
              }}
              className="mt-4 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3.5">
            {materials.map((material, index) => (
              <motion.div
                key={material.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 sm:p-5 hover:border-slate-200 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0 mt-0.5">
                      {getTypeIcon(material.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm">{material.title}</h3>
                        {getStatusBadge(material.status)}
                      </div>
                      {material.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{material.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2.5 mt-2 text-xs text-slate-400 font-medium">
                        <span className="text-slate-600 font-semibold">{material.subject || material.subjectName || 'General'}</span>
                        <span>•</span>
                        <span>Year {material.academicYear || material.year || '1'}</span>
                        <span>•</span>
                        <span>Sem {material.semester || '1'}</span>
                        <span>•</span>
                        <span>By {material.uploadedByName || 'Faculty'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                    {material.status === 'ACTIVE' ? (
                      <button
                        onClick={() => {
                          setSelectedMaterial(material);
                          setActionType('block');
                          setShowDeleteDialog(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold transition-all"
                        title="Block Material"
                      >
                        <EyeOff size={14} />
                        <span>Block</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedMaterial(material);
                          setActionType('unblock');
                          setShowDeleteDialog(true);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold transition-all"
                        title="Unblock Material"
                      >
                        <Eye size={14} />
                        <span>Restore</span>
                      </button>
                    )}
                    {material.fileUrl && (
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-xl transition-all"
                        title="Download / Preview Resource"
                      >
                        <Download size={15} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 text-xs">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 shadow-sm"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-slate-500 font-medium">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1.5 border border-slate-200 bg-white rounded-lg font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50 shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={actionType === 'block' ? 'Block Material' : 'Unblock Material'}
        message={
          actionType === 'block'
            ? `Are you sure you want to block "${selectedMaterial?.title}"? Students will no longer see this resource.`
            : `Are you sure you want to unblock "${selectedMaterial?.title}"?`
        }
        confirmLabel={actionType === 'block' ? 'Block Material' : 'Unblock Material'}
        confirmVariant={actionType === 'block' ? 'danger' : 'success'}
        onConfirm={() => {
          if (actionType === 'block') {
            handleBlockMaterial(selectedMaterial?.id, 'Blocked by admin');
          } else {
            handleUnblockMaterial(selectedMaterial?.id);
          }
        }}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedMaterial(null);
          setActionType('');
        }}
      />
    </div>
  );
};

export default AdminMaterials;