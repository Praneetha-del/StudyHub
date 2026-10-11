import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, Search, Filter, X } from 'lucide-react';
import materialService from '../../services/materialService';
import MaterialCard from '../../components/materials/MaterialCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../context/AuthContext';

const MyMaterials = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, blocked
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [filter]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = {
        status: filter === 'all' ? undefined : filter,
        size: 50
      };
      
      console.log('📤 Fetching my materials with params:', params);
      
      const response = await materialService.getMyMaterials(params);
      
      console.log('📥 My materials response:', response);
      
      // ✅ FIXED: Handle different response formats
      let materialData = [];
      
      // Check if response is successful
      if (response && response.success) {
        // Data could be in different places
        const data = response.data;
        
        if (Array.isArray(data)) {
          // Direct array
          materialData = data;
        } else if (data && data.content && Array.isArray(data.content)) {
          // Paginated response with content
          materialData = data.content;
        } else if (data && typeof data === 'object') {
          // Try to find an array in the data object
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            materialData = possibleArrays[0];
          }
        }
      } else if (Array.isArray(response)) {
        // Response is directly an array
        materialData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response.data is an array
        materialData = response.data;
      }
      
      console.log('✅ Processed materials:', materialData.length);
      setMaterials(Array.isArray(materialData) ? materialData : []);
    } catch (error) {
      console.error('❌ Failed to fetch materials:', error);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle material deletion/update
  const handleMaterialUpdate = () => {
    fetchMaterials();
  };

  const filteredMaterials = materials.filter(material => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      material.title?.toLowerCase().includes(search) ||
      material.subject?.toLowerCase().includes(search) ||
      material.description?.toLowerCase().includes(search) ||
      material.subjectName?.toLowerCase().includes(search)
    );
  });

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Published Resources</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage, update, and track all study materials you have published ({materials.length} total)
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all w-fit"
        >
          <Plus size={16} />
          <span>Upload Material</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search your materials by title, subject, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'ACTIVE' 
                  ? 'bg-white text-emerald-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('BLOCKED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === 'BLOCKED' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Blocked
            </button>
          </div>
        </div>

        {/* Search Results Count */}
        {searchTerm && (
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            Found {filteredMaterials.length} results matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-12 text-center">
          <EmptyState
            title={searchTerm ? "No matching materials found" : "No materials uploaded yet"}
            description={searchTerm ? "Try adjusting your search terms" : "Start by publishing your first lecture resource or syllabus material"}
            icon={<FileText size={40} className="text-slate-300 mx-auto mb-2" />}
            action={
              !searchTerm && (
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  <Plus size={15} />
                  <span>Upload Your First Material</span>
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((material, index) => (
            <motion.div
              key={material.id || index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <MaterialCard material={material} onUpdate={handleMaterialUpdate} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMaterials;