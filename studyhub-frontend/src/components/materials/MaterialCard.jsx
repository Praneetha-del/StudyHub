import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  File, 
  Download, 
  Eye, 
  Trash2, 
  Edit, 
  FileText, 
  Video, 
  FileImage,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import materialService from '../../services/materialService';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../common/ConfirmDialog';

const MaterialCard = ({ material, onUpdate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const isVideo = (material.type || '').toUpperCase() === 'VIDEO' || 
                  (material.type || '').toUpperCase() === 'YOUTUBE' || 
                  (material.type || '').toUpperCase().includes('VIDEO') || 
                  Boolean(material.youTubeUrl);

  const isOwner = user?.id === material.uploadedBy || user?.id === material.uploadedById;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const getFormatLabel = () => {
    const type = (material.type || '').toUpperCase();
    if (type === 'PDF') return 'PDF Note';
    if (type === 'VIDEO' || type === 'YOUTUBE') return 'Video Lecture';
    if (type === 'PPT' || type === 'PPTX') return 'Slides';
    if (type === 'DOC' || type === 'DOCX') return 'Document';
    return `${type || 'PDF'} Note`;
  };

  const getFileIcon = () => {
    const type = (material.type || '').toLowerCase();
    if (type === 'video' || type === 'youtube') return <Video className="w-4 h-4 text-blue-600" />;
    if (type === 'ppt' || type === 'pptx') return <FileImage className="w-4 h-4 text-orange-500" />;
    return <FileText className="w-4 h-4 text-blue-600" />;
  };

  const handleView = () => {
    navigate(`/materials/${material.id}`);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const blob = await materialService.downloadMaterial(material.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = material.fileName || `${material.title || 'material'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await materialService.deleteMaterial(material.id);
      toast.success('Material deleted successfully');
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete material');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/materials/edit/${material.id}`);
  };

  const formattedDate = material.createdAt 
    ? new Date(material.createdAt).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      })
    : '';

  return (
    <>
      <motion.div
        whileHover={{ y: -3 }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group"
      >
        <div>
          {/* Header - Icon and Format Badge */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50/80 text-blue-600 rounded-xl">
              {getFileIcon()}
            </div>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600">
              {getFormatLabel()}
            </span>
            {material.status === 'BLOCKED' && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-red-100 text-red-700">
                BLOCKED
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mt-3 font-bold text-slate-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
            {material.title || 'Untitled'}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 min-h-[32px] leading-relaxed">
            {material.description || 'No description provided for this academic resource.'}
          </p>

          {/* Subject and Year/Semester Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
              {material.subjectName || material.subject || 'General'}
            </span>
            <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium">
              Year {material.academicYear || material.year || '4'} • Sem {material.semester || '7'}
            </span>
          </div>
        </div>

        <div>
          {/* Author and Date Row */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#0f2744] text-white flex items-center justify-center text-[10px] font-bold uppercase shadow-xs">
                {material.uploadedByName?.charAt(0) || 'U'}
              </div>
              <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                {material.uploadedByName || 'Faculty Member'}
              </span>
            </div>
            <span className="text-slate-400 font-normal">
              {formattedDate}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleView}
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              Open
            </button>

            {!isVideo && material.fileUrl && (
              <button
                onClick={handleDownload}
                disabled={loading}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition-colors shrink-0 cursor-pointer"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </button>
            )}

            {(isOwner || isAdmin) && (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-blue-600 rounded-xl transition-colors shrink-0"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 border border-red-100 hover:bg-red-50 text-red-500 rounded-xl transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Material"
        message={`Are you sure you want to delete "${material.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={loading}
      />
    </>
  );
};

export default MaterialCard;