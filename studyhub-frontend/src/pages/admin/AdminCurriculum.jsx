import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  BookOpen,
  Calendar,
  Layers,
  RefreshCw,
  Search,
  Eye,
  Filter,
  GraduationCap
} from 'lucide-react';

const AdminCurriculum = () => {
  const { user, userDepartment, userDepartmentId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [departments, setDepartments] = useState([]);
  const [regulations, setRegulations] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allCurriculums, setAllCurriculums] = useState([]);
  
  // Filter states
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('ALL');
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL');
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState(null);
  const [formData, setFormData] = useState({
    departmentId: '',
    regulationId: '',
    joiningYear: '',
    academicYear: '',
    semester: '',
    subjectIds: [],
    subjectNames: []
  });

  // Subject inputs
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedQuickSubject, setSelectedQuickSubject] = useState('');
  
  // Subject viewer modal
  const [viewingSubjectsCurriculum, setViewingSubjectsCurriculum] = useState(null);

  // Get user's department info
  const currentDepartmentName = userDepartment || user?.department || user?.departmentName || '';
  const currentDepartmentId = userDepartmentId || user?.departmentId || '';

  // Load all data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [deptRes, regRes, subRes, currRes] = await Promise.all([
        adminService.getAllDepartments().catch(e => ({ data: [] })),
        adminService.getAllRegulations().catch(e => ({ data: [] })),
        adminService.getAllSubjects().catch(e => ({ data: [] })),
        adminService.getAllCurriculums().catch(e => ({ data: [] }))
      ]);

      const depts = Array.isArray(deptRes?.data) ? deptRes.data : [];
      const regs = Array.isArray(regRes?.data) ? regRes.data : [];
      const subs = Array.isArray(subRes?.data) ? subRes.data : [];
      const currs = Array.isArray(currRes?.data) ? currRes.data : [];

      setDepartments(depts);
      setRegulations(regs);
      setAllSubjects(subs);
      setAllCurriculums(currs);

      // If admin has a preferred department, try to match and pre-select it
      if (currentDepartmentName || currentDepartmentId) {
        const matched = depts.find(d => 
          (currentDepartmentId && d.id === currentDepartmentId) ||
          (d.code && (d.code.toLowerCase() === currentDepartmentName.toLowerCase() || currentDepartmentName.toLowerCase().includes(d.code.toLowerCase()))) ||
          (d.name && (d.name.toLowerCase() === currentDepartmentName.toLowerCase() || d.name.toLowerCase().includes(currentDepartmentName.toLowerCase())))
        );
        if (matched) {
          setFormData(prev => ({ ...prev, departmentId: matched.id }));
        } else if (depts.length > 0) {
          setFormData(prev => ({ ...prev, departmentId: depts[0].id }));
        }
      } else if (depts.length > 0) {
        setFormData(prev => ({ ...prev, departmentId: depts[0].id }));
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Failed to load curriculum data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get Department Name by ID or fallback
  const getDepartmentName = (deptId, fallbackName) => {
    if (fallbackName && fallbackName.trim() !== '') return fallbackName;
    const found = departments.find(d => d.id === deptId || d.code === deptId);
    return found ? found.name : (deptId || 'General');
  };

  // Filtered Curriculums based on user filters
  const filteredCurriculums = useMemo(() => {
    return allCurriculums.filter(curr => {
      // Department filter
      if (selectedDepartmentFilter !== 'ALL') {
        const currDeptId = curr.departmentId || '';
        const currDeptName = curr.departmentName || '';
        const selectedDeptObj = departments.find(d => d.id === selectedDepartmentFilter);
        
        const matchId = currDeptId === selectedDepartmentFilter;
        const matchCode = selectedDeptObj?.code && (currDeptId.toLowerCase() === selectedDeptObj.code.toLowerCase() || currDeptName.toLowerCase() === selectedDeptObj.code.toLowerCase());
        const matchName = selectedDeptObj?.name && currDeptName.toLowerCase() === selectedDeptObj.name.toLowerCase();

        if (!matchId && !matchCode && !matchName) {
          return false;
        }
      }

      // Semester filter
      if (selectedSemesterFilter !== 'ALL') {
        if (String(curr.semester) !== String(selectedSemesterFilter)) {
          return false;
        }
      }

      // Academic Year filter
      if (selectedYearFilter !== 'ALL') {
        if (String(curr.academicYear) !== String(selectedYearFilter)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const deptName = (curr.departmentName || getDepartmentName(curr.departmentId)).toLowerCase();
        const batchYear = String(curr.joiningYear || '');
        const sem = `sem ${curr.semester || ''} semester ${curr.semester || ''}`;
        const subNames = (curr.subjectNames || []).join(' ').toLowerCase();

        const match = deptName.includes(query) ||
                      batchYear.includes(query) ||
                      sem.includes(query) ||
                      subNames.includes(query);

        if (!match) return false;
      }

      return true;
    });
  }, [allCurriculums, selectedDepartmentFilter, selectedSemesterFilter, selectedYearFilter, searchQuery, departments]);

  // Subjects available for selected department in form
  const availableSubjectsForForm = useMemo(() => {
    if (!formData.departmentId) return allSubjects;
    const chosenDept = departments.find(d => d.id === formData.departmentId);
    return allSubjects.filter(sub => {
      if (sub.departmentId === formData.departmentId) return true;
      if (chosenDept) {
        if (sub.department && (sub.department.toLowerCase() === chosenDept.name.toLowerCase() || sub.department.toLowerCase() === chosenDept.code?.toLowerCase())) {
          return true;
        }
      }
      return false;
    });
  }, [allSubjects, formData.departmentId, departments]);

  // Form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add a subject by typed text
  const handleAddNewSubject = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const subName = newSubjectName.trim();
    if (!subName) {
      toast.error('Please enter a subject name');
      return;
    }

    const exists = (formData.subjectNames || []).some(
      s => s.toLowerCase() === subName.toLowerCase()
    );

    if (exists) {
      toast.error(`Subject "${subName}" is already in the list`);
      return;
    }

    const newId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    setFormData(prev => ({
      ...prev,
      subjectIds: [...(prev.subjectIds || []), newId],
      subjectNames: [...(prev.subjectNames || []), subName]
    }));

    setNewSubjectName('');
    toast.success(`Added "${subName}"`);
  };

  // Quick-add from existing repository subjects
  const handleQuickAddSubject = (subjectObj) => {
    if (!subjectObj) return;
    const subName = subjectObj.subjectName || subjectObj.name;
    const subId = subjectObj.id;

    if (!subName) return;

    const exists = (formData.subjectNames || []).some(
      s => s.toLowerCase() === subName.toLowerCase()
    );

    if (exists) {
      toast.error(`Subject "${subName}" is already added`);
      return;
    }

    setFormData(prev => ({
      ...prev,
      subjectIds: [...(prev.subjectIds || []), subId || `sub-${Date.now()}`],
      subjectNames: [...(prev.subjectNames || []), subName]
    }));

    toast.success(`Added "${subName}"`);
  };

  // Remove a subject from form
  const handleRemoveSubject = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      subjectIds: (prev.subjectIds || []).filter((_, idx) => idx !== indexToRemove),
      subjectNames: (prev.subjectNames || []).filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Open Edit Mode
  const handleEdit = (curr) => {
    setEditingCurriculum(curr);
    setFormData({
      departmentId: curr.departmentId || (departments[0]?.id || ''),
      regulationId: curr.regulationId || '',
      joiningYear: curr.joiningYear ? String(curr.joiningYear) : '',
      academicYear: curr.academicYear ? String(curr.academicYear) : '',
      semester: curr.semester ? String(curr.semester) : '',
      subjectIds: Array.isArray(curr.subjectIds) ? [...curr.subjectIds] : [],
      subjectNames: Array.isArray(curr.subjectNames) ? [...curr.subjectNames] : []
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form
  const resetForm = () => {
    const defaultDept = departments.find(d => 
      (currentDepartmentId && d.id === currentDepartmentId) ||
      (currentDepartmentName && (d.name?.toLowerCase() === currentDepartmentName.toLowerCase() || d.code?.toLowerCase() === currentDepartmentName.toLowerCase()))
    )?.id || departments[0]?.id || '';

    setFormData({
      departmentId: defaultDept,
      regulationId: '',
      joiningYear: '',
      academicYear: '',
      semester: '',
      subjectIds: [],
      subjectNames: []
    });
    setEditingCurriculum(null);
    setShowForm(false);
    setNewSubjectName('');
    setSelectedQuickSubject('');
  };

  // Submit create or update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.departmentId) {
      toast.error('Please select a department');
      return;
    }
    if (!formData.joiningYear) {
      toast.error('Please select joining batch year');
      return;
    }
    if (!formData.academicYear) {
      toast.error('Please select academic year');
      return;
    }
    if (!formData.semester) {
      toast.error('Please select semester');
      return;
    }
    if (!formData.subjectNames || formData.subjectNames.length === 0) {
      toast.error('Please add at least one subject to this curriculum');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        departmentId: formData.departmentId,
        regulationId: formData.regulationId || undefined,
        joiningYear: parseInt(formData.joiningYear, 10),
        academicYear: parseInt(formData.academicYear, 10),
        semester: parseInt(formData.semester, 10),
        subjectIds: formData.subjectIds,
        subjectNames: formData.subjectNames
      };

      let response;
      if (editingCurriculum) {
        response = await adminService.updateCurriculum(editingCurriculum.id, payload);
      } else {
        response = await adminService.createCurriculum(payload);
      }

      if (response && response.success !== false) {
        toast.success(editingCurriculum ? 'Curriculum updated successfully!' : 'Curriculum created successfully!');
        resetForm();
        await loadAllData();
      } else {
        toast.error(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('❌ Save curriculum error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save curriculum');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete curriculum
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this curriculum schedule?')) return;

    try {
      const response = await adminService.deleteCurriculum(id);
      if (response && response.success !== false) {
        toast.success('Curriculum deleted successfully');
        await loadAllData();
      } else {
        toast.error(response?.message || 'Failed to delete curriculum');
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error('Failed to delete curriculum');
    }
  };

  // Year & Semester Options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = 2020; y <= currentYear + 5; y++) {
    yearOptions.push({ value: String(y), label: `Batch ${y}` });
  }

  const academicYearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  const semesterOptions = [
    { value: '1', label: 'Semester 1' },
    { value: '2', label: 'Semester 2' },
    { value: '3', label: 'Semester 3' },
    { value: '4', label: 'Semester 4' },
    { value: '5', label: 'Semester 5' },
    { value: '6', label: 'Semester 6' },
    { value: '7', label: 'Semester 7' },
    { value: '8', label: 'Semester 8' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
            <GraduationCap size={14} />
            <span>Academic Curriculum Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Curriculum Architecture</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Configure department batches, semesters, and active subject maps for students and faculty.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            title="Refresh Curriculums"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
          
          <button 
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? 'Close Editor' : 'New Curriculum Mapping'}</span>
          </button>
        </div>
      </div>

      {/* Curriculum Form (Create / Edit) */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-lg p-6 sm:p-8 transition-all animate-in fade-in">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingCurriculum ? 'Edit Curriculum Mapping' : 'Create New Curriculum Mapping'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign subjects to a specific department, batch year, and semester schedule.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department *
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} {dept.code ? `(${dept.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Joining Batch Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Joining Batch Year *
                </label>
                <select
                  name="joiningYear"
                  value={formData.joiningYear}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Select Batch Year</option>
                  {yearOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Academic Year *
                </label>
                <select
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Select Year</option>
                  {academicYearOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesterOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Curriculum Subjects Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Subjects for this Curriculum *
                </label>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                  {formData.subjectNames?.length || 0} Subject{formData.subjectNames?.length !== 1 ? 's' : ''} Added
                </span>
              </div>

              {/* Add Subject Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Text Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewSubject(e);
                      }
                    }}
                    placeholder="Type subject name (e.g. Operating Systems)"
                    className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewSubject}
                    disabled={!newSubjectName.trim()}
                    className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Quick Add from Existing Repository */}
                {availableSubjectsForForm.length > 0 && (
                  <div className="flex gap-2">
                    <select
                      value={selectedQuickSubject}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedQuickSubject(val);
                        if (val) {
                          const found = availableSubjectsForForm.find(s => (s.id === val || s.subjectName === val));
                          if (found) handleQuickAddSubject(found);
                          setSelectedQuickSubject('');
                        }
                      }}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                    >
                      <option value="">Quick Pick from Existing Subjects...</option>
                      {availableSubjectsForForm.map(sub => (
                        <option key={sub.id || sub.subjectName} value={sub.id || sub.subjectName}>
                          {sub.subjectName} {sub.department ? `(${sub.department})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Added Subjects List */}
              {(!formData.subjectNames || formData.subjectNames.length === 0) ? (
                <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-500 bg-slate-50/40">
                  <BookOpen className="w-8 h-8 mx-auto mb-1.5 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700">No subjects added yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Type a subject name above or pick from existing subjects to build this curriculum.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl p-3 sm:p-4 bg-slate-50/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {formData.subjectNames.map((name, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 shadow-xs"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate">{name}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(idx)}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                          title="Remove subject"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving Curriculum...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{editingCurriculum ? 'Update Curriculum' : 'Save Curriculum Mapping'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Department
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedDepartmentFilter}
                onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
              >
                <option value="ALL">All Departments ({allCurriculums.length})</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Year Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Academic Year
            </label>
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Years</option>
              {academicYearOptions.map(y => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Semester
            </label>
            <select
              value={selectedSemesterFilter}
              onChange={(e) => setSelectedSemesterFilter(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
            >
              <option value="ALL">All Semesters</option>
              {semesterOptions.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Curriculums
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, batch, dept..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-bold">
              Showing {filteredCurriculums.length} of {allCurriculums.length} Curriculum Schedules
            </span>
            {selectedDepartmentFilter !== 'ALL' && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                Filtered by Department
              </span>
            )}
          </div>

          {(selectedDepartmentFilter !== 'ALL' || selectedSemesterFilter !== 'ALL' || selectedYearFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDepartmentFilter('ALL');
                setSelectedSemesterFilter('ALL');
                setSelectedYearFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Curriculum Table / List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs text-slate-500 font-medium">Loading all curriculum records...</p>
          </div>
        ) : filteredCurriculums.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Layers size={22} />
            </div>
            <p className="text-sm font-bold text-slate-900 mb-1">
              {allCurriculums.length === 0 ? 'No Curriculums Configured' : 'No Curriculums Match Your Filters'}
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {allCurriculums.length === 0
                ? 'Get started by creating your first curriculum mapping for a department batch.'
                : 'Try adjusting your search query or department filters above.'}
            </p>
            {allCurriculums.length === 0 ? (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Create New Mapping</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedDepartmentFilter('ALL');
                  setSelectedSemesterFilter('ALL');
                  setSelectedYearFilter('ALL');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Joining Batch</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Academic Year</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Mapped Subjects</th>
                  <th className="px-5 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCurriculums.map(curr => {
                  const displayDeptName = getDepartmentName(curr.departmentId, curr.departmentName);
                  const subjectCount = curr.subjectNames?.length || curr.subjectIds?.length || 0;

                  return (
                    <tr key={curr.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <Building2 size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{displayDeptName}</p>
                            {curr.regulationName && (
                              <p className="text-[10px] text-slate-400 font-medium">{curr.regulationName}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                        Batch {curr.joiningYear || 'N/A'}
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600 font-medium">
                        Year {curr.academicYear || 'N/A'}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg font-bold text-[11px]">
                          Sem {curr.semester || 'N/A'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-bold text-[11px]">
                            {subjectCount} {subjectCount === 1 ? 'subject' : 'subjects'}
                          </span>
                          {subjectCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setViewingSubjectsCurriculum(curr)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title="View Subject Names"
                            >
                              <Eye size={12} className="text-blue-600" />
                              <span>View</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(curr)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Curriculum"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(curr.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Curriculum"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subject Viewer Modal */}
      {viewingSubjectsCurriculum && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-base text-white">Configured Curriculum Subjects</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {getDepartmentName(viewingSubjectsCurriculum.departmentId, viewingSubjectsCurriculum.departmentName)} • Batch {viewingSubjectsCurriculum.joiningYear} • Year {viewingSubjectsCurriculum.academicYear} • Sem {viewingSubjectsCurriculum.semester}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingSubjectsCurriculum(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>Subject List</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold">
                  {viewingSubjectsCurriculum.subjectNames?.length || 0} Total Subjects
                </span>
              </div>

              {(!viewingSubjectsCurriculum.subjectNames || viewingSubjectsCurriculum.subjectNames.length === 0) ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">No subject names found in this curriculum mapping.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {viewingSubjectsCurriculum.subjectNames.map((subjectName, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{subjectName}</p>
                        {viewingSubjectsCurriculum.subjectIds?.[index] && (
                          <p className="text-[10px] text-slate-400 font-mono truncate">
                            ID: {viewingSubjectsCurriculum.subjectIds[index]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingSubjectsCurriculum(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCurriculum;