import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import materialService from '../../services/materialService';
import MaterialCard from '../../components/materials/MaterialCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';

const Materials = () => {
  const { user, userDepartment, userDepartmentId, setUser, isStudent } = useAuth();
  
  // State
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const studentJoiningBatch = user?.joiningYear ? String(user.joiningYear) : '2023';
  const [selectedJoiningYear, setSelectedJoiningYear] = useState(studentJoiningBatch);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(user?.year ? String(user.year) : '1');
  const [selectedSemester, setSelectedSemester] = useState(user?.semester ? String(user.semester) : '1');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  // Curriculum and subjects
  const [allCurriculums, setAllCurriculums] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [isMapping, setIsMapping] = useState(false);
  
  // Show filters
  const [showFilters, setShowFilters] = useState(false);

  // Helper to extract digits e.g. "1st Year" -> 1, "Semester 1" -> 1, 1 -> 1
  const cleanNum = useCallback((val) => {
    if (val == null || val === '') return null;
    const digits = String(val).replace(/\D+/g, '');
    return digits ? parseInt(digits, 10) : null;
  }, []);

  // Helper to extract and update subjects from curriculums & materials
  const updateSubjectsList = useCallback((curriculums, jYear, aYear, sem, materialsList = []) => {
    let foundSubjects = [];

    const numJYear = cleanNum(jYear);
    const numAYear = cleanNum(aYear);
    const numSem = cleanNum(sem);

    if (curriculums && curriculums.length > 0) {
      // 1. Try to find exact matching curriculum by semester, academic year, and joining year
      let matched = curriculums.find(c => {
        const cJ = cleanNum(c.joiningYear);
        const cA = cleanNum(c.academicYear);
        const cS = cleanNum(c.semester);

        let match = true;
        if (numSem != null && cS != null && cS !== numSem) match = false;
        if (numAYear != null && cA != null && cA !== numAYear) match = false;
        if (numJYear != null && cJ != null && cJ !== numJYear) match = false;
        return match;
      });

      // 2. Fallback: Match by semester and academic year
      if (!matched && numSem != null && numAYear != null) {
        matched = curriculums.find(c => {
          const cA = cleanNum(c.academicYear);
          const cS = cleanNum(c.semester);
          return cS === numSem && cA === numAYear;
        });
      }

      // 3. Fallback: Match by semester only
      if (!matched && numSem != null) {
        matched = curriculums.find(c => cleanNum(c.semester) === numSem);
      }

      // 4. Fallback: Match by academic year only
      if (!matched && numAYear != null) {
        matched = curriculums.find(c => cleanNum(c.academicYear) === numAYear);
      }

      if (matched) {
        if (matched.subjectNames && Array.isArray(matched.subjectNames) && matched.subjectNames.length > 0) {
          foundSubjects = matched.subjectNames.map((name, index) => ({
            id: (matched.subjectIds && matched.subjectIds[index]) || name,
            name: name,
            subjectName: name
          }));
        } else if (matched.subjects && Array.isArray(matched.subjects) && matched.subjects.length > 0) {
          foundSubjects = matched.subjects.map((sub, index) => ({
            id: sub.id || sub.subjectName || sub.name || `sub-${index}`,
            name: sub.subjectName || sub.name || (typeof sub === 'string' ? sub : `Subject ${index + 1}`),
            subjectName: sub.subjectName || sub.name || (typeof sub === 'string' ? sub : `Subject ${index + 1}`)
          }));
        }
      }

      // 5. Fallback: Collect all subject names across department curriculums
      if (foundSubjects.length === 0) {
        const allNames = new Set();
        curriculums.forEach(c => {
          if (c.subjectNames && Array.isArray(c.subjectNames)) {
            c.subjectNames.forEach(n => { if (n) allNames.add(n); });
          }
        });
        foundSubjects = Array.from(allNames).map((name, index) => ({
          id: `sub-curr-${index}`,
          name: name,
          subjectName: name
        }));
      }
    }

    // 6. Fallback: Collect unique subjects from materials list
    if (foundSubjects.length === 0 && materialsList && materialsList.length > 0) {
      const matSubjects = new Set();
      materialsList.forEach(m => {
        const sName = m.subject || m.subjectName;
        if (sName) matSubjects.add(sName);
      });
      foundSubjects = Array.from(matSubjects).map((name, index) => ({
        id: `sub-mat-${index}`,
        name: name,
        subjectName: name
      }));
    }

    setSubjects(foundSubjects);
  }, [cleanNum]);

  // Auto-map department from user profile
  useEffect(() => {
    const autoMapDepartment = async () => {
      const deptName = userDepartment || user?.department || user?.departmentName || '';
      const deptId = userDepartmentId || user?.departmentId || '';
      
      if (deptId) {
        setSelectedDepartmentId(deptId);
        setSelectedDepartmentName(deptName || '');
        fetchCurriculumsForDepartment(deptId, deptName);
        return;
      }
      
      if (!deptName) return;
      
      setIsMapping(true);
      try {
        const response = await adminService.getPublicDepartments();
        if (response && response.success) {
          const departments = response.data || [];
          const found = departments.find(d => 
            d.name?.toLowerCase() === deptName?.toLowerCase() ||
            d.code?.toLowerCase() === deptName?.toLowerCase()
          );
          
          if (found) {
            setSelectedDepartmentId(found.id);
            setSelectedDepartmentName(found.name);
            
            if (setUser) {
              setUser(prev => ({ 
                ...prev, 
                departmentId: found.id,
                department: found.name 
              }));
            }
            fetchCurriculumsForDepartment(found.id, found.name);
          }
        }
      } catch (error) {
        console.error('❌ Error auto-mapping department:', error);
      } finally {
        setIsMapping(false);
      }
    };
    
    autoMapDepartment();
  }, [userDepartment, userDepartmentId, user, setUser]);

  // Fetch curriculums for department
  const fetchCurriculumsForDepartment = async (deptId, deptName) => {
    setLoadingFilters(true);
    try {
      const response = await adminService.getPublicCurriculums({ 
        departmentName: deptName,
        departmentId: deptId
      });
      
      if (response && response.success) {
        const data = response.data || [];
        setAllCurriculums(data);
        
        // Auto-update subjects with current filters
        updateSubjectsList(
          data, 
          selectedJoiningYear, 
          selectedAcademicYear, 
          selectedSemester, 
          materials
        );
      }
    } catch (error) {
      console.error('❌ Error fetching curriculum:', error);
    } finally {
      setLoadingFilters(false);
    }
  };

  // Re-calculate subjects when curriculum, joining year, academic year, or semester changes
  useEffect(() => {
    updateSubjectsList(
      allCurriculums, 
      selectedJoiningYear, 
      selectedAcademicYear, 
      selectedSemester, 
      materials
    );
  }, [allCurriculums, selectedJoiningYear, selectedAcademicYear, selectedSemester, materials, updateSubjectsList]);

  // Fetch materials with proper subject filtering
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const semNum = cleanNum(selectedSemester);
      const params = {
        departmentId: selectedDepartmentId,
        ...(semNum && { semester: semNum }),
        ...(selectedType && { type: selectedType }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await materialService.getAllMaterials(params);
      let materialData = [];
      if (response && response.success) {
        const data = response.data;
        if (Array.isArray(data)) {
          materialData = data;
        } else if (data && data.content && Array.isArray(data.content)) {
          materialData = data.content;
        } else if (data && typeof data === 'object') {
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            materialData = possibleArrays[0];
          }
        }
      }
      
      // Filter by joining year (if selected)
      const targetJYear = cleanNum(selectedJoiningYear);
      if (targetJYear) {
        materialData = materialData.filter(m => {
          const mJYear = cleanNum(m.joiningYear);
          return !mJYear || mJYear === targetJYear;
        });
      }
      
      // Filter by academic year
      const targetAYear = cleanNum(selectedAcademicYear);
      if (targetAYear) {
        materialData = materialData.filter(m => {
          const mAYear = cleanNum(m.academicYear) || cleanNum(m.year);
          return !mAYear || mAYear === targetAYear;
        });
      }
      
      // Filter by semester
      const targetSem = cleanNum(selectedSemester);
      if (targetSem) {
        materialData = materialData.filter(m => {
          const mSem = cleanNum(m.semester);
          return !mSem || mSem === targetSem;
        });
      }
      
      // Filter by subject
      if (selectedSubject) {
        const targetSubject = selectedSubject.toLowerCase().trim();
        materialData = materialData.filter(m => {
          const materialSubject = (m.subject || m.subjectName || '').toLowerCase().trim();
          const materialSubjectId = (m.subjectId || '').toLowerCase().trim();
          
          return materialSubjectId === targetSubject || 
                 materialSubject === targetSubject ||
                 materialSubject.includes(targetSubject);
        });
      }

      // Filter by format / type
      if (selectedType) {
        const targetType = selectedType.toUpperCase().trim();
        materialData = materialData.filter(m => {
          const mType = (m.type || '').toUpperCase().trim();
          if (targetType === 'VIDEO' || targetType === 'YOUTUBE') {
            return mType === 'VIDEO' || mType === 'YOUTUBE' || mType.includes('VIDEO') || Boolean(m.youTubeUrl);
          }
          if (targetType === 'PDF') {
            return mType === 'PDF' || (m.fileName && m.fileName.toLowerCase().endsWith('.pdf'));
          }
          if (targetType === 'PPT' || targetType === 'PPTX') {
            return mType === 'PPT' || mType === 'PPTX' || (m.fileName && (m.fileName.toLowerCase().endsWith('.ppt') || m.fileName.toLowerCase().endsWith('.pptx')));
          }
          if (targetType === 'DOC' || targetType === 'DOCX') {
            return mType === 'DOC' || mType === 'DOCX' || (m.fileName && (m.fileName.toLowerCase().endsWith('.doc') || m.fileName.toLowerCase().endsWith('.docx')));
          }
          return mType === targetType;
        });
      }
      
      setMaterials(materialData);
      setFilteredMaterials(materialData);

      // Populate subjects if curriculums were empty
      updateSubjectsList(allCurriculums, selectedJoiningYear, selectedAcademicYear, selectedSemester, materialData);
      
    } catch (error) {
      console.error('❌ Error fetching materials:', error);
      toast.error('Failed to load materials');
      setMaterials([]);
      setFilteredMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDepartmentId, selectedSubject, selectedSemester, selectedType, searchTerm, selectedJoiningYear, selectedAcademicYear, allCurriculums, cleanNum, updateSubjectsList]);

  // Initial and reactive fetch
  useEffect(() => {
    if (selectedDepartmentId) {
      fetchMaterials();
    }
  }, [selectedDepartmentId, selectedJoiningYear, selectedAcademicYear, selectedSemester, selectedSubject, selectedType]);

  // Apply search filter locally
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = materials.filter(m => 
        (m.title && m.title.toLowerCase().includes(term)) ||
        (m.subject && m.subject.toLowerCase().includes(term)) ||
        (m.description && m.description.toLowerCase().includes(term)) ||
        (m.uploadedByName && m.uploadedByName.toLowerCase().includes(term))
      );
      setFilteredMaterials(filtered);
    } else {
      setFilteredMaterials(materials);
    }
  }, [searchTerm, materials]);

  const clearFilters = () => {
    setSearchTerm('');
    if (!isStudent) {
      setSelectedJoiningYear('2023');
    }
    setSelectedAcademicYear('1');
    setSelectedSemester('1');
    setSelectedSubject('');
    setSelectedType('');
  };

  const hasActiveFilters = 
    searchTerm || 
    selectedSubject || 
    selectedType;

  // Student batch only or all batches for teacher/admin
  const joiningYearOptions = useMemo(() => {
    const studentBatch = user?.joiningYear ? String(user.joiningYear) : '2023';
    if (isStudent) {
      return [{ value: studentBatch, label: `${studentBatch} Batch • My Batch` }];
    }
    const defaultBatches = [
      { value: studentBatch, label: `${studentBatch} Batch • My Batch` },
      { value: '2025', label: '2025 Batch' },
      { value: '2024', label: '2024 Batch' },
      { value: '2023', label: '2023 Batch' },
      { value: '2022', label: '2022 Batch' },
      { value: '2021', label: '2021 Batch' }
    ];
    return defaultBatches.filter((v, i, a) => a.findIndex(t => t.value === v.value) === i);
  }, [isStudent, user?.joiningYear]);

  const academicYearOptions = [
    { value: '', label: 'All Years' },
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' }
  ];

  const semesterOptions = [
    { value: '', label: 'All Semesters' },
    { value: '1', label: 'Semester 1' },
    { value: '2', label: 'Semester 2' },
    { value: '3', label: 'Semester 3' },
    { value: '4', label: 'Semester 4' },
    { value: '5', label: 'Semester 5' },
    { value: '6', label: 'Semester 6' },
    { value: '7', label: 'Semester 7' },
    { value: '8', label: 'Semester 8' }
  ];

  const formatOptions = [
    { value: '', label: 'All Formats' },
    { value: 'PDF', label: 'PDF Note' },
    { value: 'VIDEO', label: 'Video Lecture' },
    { value: 'PPT', label: 'Presentation Slides' },
    { value: 'DOC', label: 'Word Document' }
  ];

  const departmentDisplay = selectedDepartmentName || userDepartment || user?.department || 'IT';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Row */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 text-blue-700 border border-blue-100 rounded-full text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>{departmentDisplay} Department</span>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Study Materials & Lecture Notes
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Discover verified lecture notes, question banks, and learning materials curated by your faculty
            </p>
          </div>

          <button
            onClick={() => fetchMaterials()}
            className="p-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl transition-all shadow-xs shrink-0"
            title="Refresh materials"
          >
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        {/* Row 1: Search Input & Action Buttons */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search materials by title, subject name, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters || hasActiveFilters
                ? 'border-blue-200 bg-blue-50/60 text-blue-600'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter size={16} />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>
          
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Row 2: Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Batch (Joining Year) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              BATCH (JOINING YEAR)
            </label>
            <select
              value={selectedJoiningYear}
              onChange={(e) => setSelectedJoiningYear(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {!isStudent && <option value="">All Batches</option>}
              {joiningYearOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Academic Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              ACADEMIC YEAR
            </label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {academicYearOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              SEMESTER
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {semesterOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              SUBJECT
            </label>
            {loadingFilters ? (
              <div className="flex items-center gap-2 px-3 py-2 text-slate-400 text-xs border border-slate-200 rounded-xl">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                Loading...
              </div>
            ) : (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="">All Subjects ({subjects.length})</option>
                {subjects.map((sub, idx) => {
                  const subName = sub.name || sub.subjectName || (typeof sub === 'string' ? sub : `Subject ${idx + 1}`);
                  const subId = sub.id || subName;
                  return (
                    <option key={subId} value={subName}>
                      {subName}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Format */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              FORMAT
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              {formatOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Count and Reset link */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredMaterials.length}</span> of <span className="font-bold text-slate-800">{materials.length}</span> materials
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredMaterials.length === 0 ? (
        <EmptyState
          title={searchTerm ? "No matching materials found" : "No Materials Found"}
          description={
            searchTerm 
              ? "Try adjusting your search terms or filters" 
              : "Try adjusting or clearing your filters to see more results."
          }
          icon={<BookOpen size={48} className="text-slate-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((material, index) => (
            <motion.div
              key={material.id || index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <MaterialCard material={material} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Materials;