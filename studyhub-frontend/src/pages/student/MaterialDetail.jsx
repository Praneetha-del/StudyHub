import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Download, File, Video, Calendar, User, 
  BookOpen, Tag, Clock, Sparkles, FileText, Eye,
  ExternalLink, Lock, Loader2
} from 'lucide-react';
import materialService from '../../services/materialService';
import aiService from '../../services/aiService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';
import toast from 'react-hot-toast';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [hasSummary, setHasSummary] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialService.getMaterialById(id);
      console.log('📥 Material detail response:', response);
      
      if (response && response.success) {
        setMaterial(response.data);
        // Check if summary exists
        checkSummary();
      } else {
        setError('Material not found');
      }
    } catch (error) {
      console.error('❌ Error fetching material:', error);
      setError(error.response?.data?.message || 'Failed to load material');
    } finally {
      setLoading(false);
    }
  };

  const checkSummary = async () => {
    try {
      const response = await aiService.getSummary(id);
      if (response && response.data) {
        setSummary(response.data);
        setHasSummary(true);
      }
    } catch (error) {
      console.log('No summary found');
    }
  };

  const generateSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await aiService.generateSummary(id);
      if (response && response.success) {
        setSummary(response.data);
        setHasSummary(true);
        toast.success('Summary generated successfully!');
      } else {
        toast.error('Failed to generate summary');
      }
    } catch (error) {
      console.error('❌ Summary error:', error);
      toast.error('Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  // ✅ FIXED: Download handler using blob
  const handleDownload = async () => {
    setDownloadLoading(true);
    try {
      const blob = await materialService.downloadMaterial(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = material?.fileName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started!');
    } catch (error) {
      console.error('❌ Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadLoading(false);
    }
  };

  // ✅ Get file URL for preview
  const getFileUrl = () => {
    if (material?.fileUrl) return material.fileUrl;
    if (material?.youTubeUrl) return material.youTubeUrl;
    return null;
  };

  // ✅ Check if file can be previewed
  const canPreview = () => {
    if (!material) return false;
    const type = material.type?.toLowerCase() || '';
    const fileUrl = getFileUrl();
    if (!fileUrl) return false;
    if (type === 'youtube' || type === 'video') return true;
    if (type === 'pdf') return true;
    if (fileUrl.includes('cloudinary')) return true;
    return false;
  };

  // ✅ Get YouTube embed URL
  const getYouTubeEmbedUrl = () => {
    if (!material?.youTubeUrl) return null;
    let url = material.youTubeUrl;
    // Convert to embed URL
    if (url.includes('watch?v=')) {
      url = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        url = `https://www.youtube.com/embed/${videoId}`;
      }
    }
    return url;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !material) {
    return <ErrorState message={error || 'Material not found'} onRetry={fetchMaterial} />;
  }

  if (material.status === 'BLOCKED') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <Lock className="text-red-600" size={48} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Material Blocked</h2>
        <p className="text-gray-600 text-center max-w-md">
          This material has been blocked by the administrator and is not available.
        </p>
        <Link to="/materials" className="mt-4 text-blue-600 hover:text-blue-800">
          Browse other materials
        </Link>
      </div>
    );
  }

  const isYouTube = material.type === 'VIDEO' || material.type === 'YOUTUBE' || material.youTubeUrl;
  const fileUrl = getFileUrl();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={16} className="mr-1.5" />
        Back to Materials
      </button>

      {/* Main Material Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="p-6 sm:p-8">
          {/* Badges & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {material.type || 'FILE'}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                material.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {material.status || 'ACTIVE'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {!isYouTube && material.status === 'ACTIVE' && (
                <button
                  onClick={handleDownload}
                  disabled={downloadLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                  {downloadLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  <span>{downloadLoading ? 'Downloading...' : 'Download File'}</span>
                </button>
              )}
              {isYouTube && material.youTubeUrl && (
                <a
                  href={material.youTubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  <ExternalLink size={15} />
                  <span>Watch on YouTube</span>
                </a>
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            {material.title || 'Untitled'}
          </h1>

          {/* Description */}
          {material.description && (
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {material.description}
            </p>
          )}

          {/* File Preview Section */}
          {fileUrl && canPreview() && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
              {isYouTube ? (
                <div className="aspect-video w-full">
                  <iframe
                    src={getYouTubeEmbedUrl()}
                    className="w-full h-full"
                    allowFullScreen
                    title={material.title || 'Video'}
                  />
                </div>
              ) : material.type?.toLowerCase() === 'pdf' ? (
                <div className="w-full" style={{ height: '550px' }}>
                  <iframe
                    src={fileUrl}
                    className="w-full h-full border-none"
                    title={material.title || 'PDF Preview'}
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">{material.fileName || 'Document File'}</p>
                  {material.fileSize && (
                    <p className="text-xs text-slate-400 mt-1">
                      {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-slate-100 bg-slate-50/50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8">
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Subject</p>
              <p className="text-xs font-bold text-slate-800 mt-1 truncate">{material.subjectName || material.subject || 'N/A'}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Year</p>
              <p className="text-xs font-bold text-slate-800 mt-1">{material.academicYear || material.year || 'N/A'}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Semester</p>
              <p className="text-xs font-bold text-slate-800 mt-1">Sem {material.semester || 'N/A'}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Uploaded By</p>
              <p className="text-xs font-bold text-slate-800 mt-1 truncate">{material.uploadedByName || 'Faculty'}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Department</p>
              <p className="text-xs font-bold text-slate-800 mt-1 truncate">{material.departmentName || 'N/A'}</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Date</p>
              <p className="text-xs font-bold text-slate-800 mt-1">
                {material.createdAt ? new Date(material.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Academic Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Material Summary</h2>
              <p className="text-xs text-slate-400">Intelligent breakdown generated from resource contents</p>
            </div>
          </div>
          {!hasSummary && !summaryLoading && (
            <button
              onClick={generateSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition-all"
            >
              <Sparkles size={14} />
              <span>Generate Summary</span>
            </button>
          )}
        </div>

        {summaryLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2.5 text-xs font-medium text-slate-600">Analyzing document and generating AI summary...</span>
          </div>
        ) : hasSummary && summary ? (
          <div className="space-y-4 pt-2">
            {summary.summary && (
              <div className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">Overview</h3>
                <p className="text-xs text-slate-700 leading-relaxed">{summary.summary}</p>
              </div>
            )}
            {summary.keyPoints && summary.keyPoints.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Key Takeaways</h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {summary.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {summary.importantConcepts && summary.importantConcepts.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Core Concepts</h3>
                <div className="flex flex-wrap gap-1.5">
                  {summary.importantConcepts.map((concept, i) => (
                    <span key={i} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-medium">
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 bg-slate-50/50 rounded-xl border border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Click <strong className="text-blue-600">"Generate Summary"</strong> to produce an autonomous synopsis, key formulas, and exam takeaways for this document.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MaterialDetail;