import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import materialService from '../../services/materialService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { Upload, File, Loader2, AlertCircle, CheckCircle, Users } from 'lucide-react';

const UploadMaterial = () => {
  const { user, userDepartment, userDepartmentId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [uploadType, setUploadType] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Department, Curriculum & Subject lists
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    departmentName: '',
    joiningYear: '2023',
    academicYear: '1',
    semester: '1',
    subjectId: '',
    subjectName: '',
    type: 'PDF',
    youTubeUrl: '',
    fileName: ''
  });

  // Load Departments on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingInitial(true);
        // 1. Fetch departments
        let deptList = [];
        try {
          const deptRes = await adminService.getPublicDepartments();
          if (deptRes && deptRes.success && Array.isArray(deptRes.data)) {
            deptList = deptRes.data;
          }
        } catch (e) {
          console.warn('Could not fetch public departments:', e);
        }

        // Check if teacher has specific assigned departments
        try {
          const assignedRes = await adminService.getTeacherAssignedDepartments();
          if (assignedRes && assignedRes.success && Array.isArray(assignedRes.data) && assignedRes.data.length > 0) {
            // Merge or mark assigned departments
            const assignedIds = new Set(assignedRes.data.map(d => d.departmentId));
            deptList = deptList.map(d => ({
              ...d,
              isAssigned: assignedIds.has(d.id)
            }));
          }
        } catch (e) {
          console.warn('Assigned departments check:', e);
        }

        if (deptList.length === 0) {
          // Fallback common departments
          deptList = [
            { id: 'dept-it', name: 'Information Technology', code: 'IT' },
            { id: 'dept-cse', name: 'Computer Science & Engineering', code: 'CSE' },
            { id: 'dept-ece', name: 'Electronics & Communication Engineering', code: 'ECE' },
            { id: 'dept-eee', name: 'Electrical & Electronics Engineering', code: 'EEE' },
            { id: 'dept-mech', name: 'Mechanical Engineering', code: 'MECH' },
            { id: 'dept-civil', name: 'Civil Engineering', code: 'CIVIL' },
            { id: 'dept-csm', name: 'CSE (AI & ML)', code: 'CSM' },
            { id: 'dept-csd', name: 'CSE (Data Science)', code: 'CSD' }
          ];
        }
        setDepartments(deptList);

        // Set default department from teacher's profile if available
        const defaultDept = deptList.find(d => 
          d.id === userDepartmentId || 
          d.name?.toLowerCase() === (userDepartment || user?.department || '').toLowerCase() ||
          d.code?.toLowerCase() === (userDepartment || user?.department || '').toLowerCase()
        ) || deptList[0];

        if (defaultDept) {
          setFormData(prev => ({
            ...prev,
            departmentId: defaultDept.id,
            departmentName: defaultDept.name,
          }));
        }
      } catch (err) {
        console.error('Error loading initial data in upload:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadInitialData();
  }, [user, userDepartment, userDepartmentId]);

  // Fetch subjects whenever department, academicYear, or semester changes
  useEffect(() => {
    if (formData.departmentId || formData.departmentName) {
      fetchSubjectsForCurriculum();
    }
  }, [formData.departmentId, formData.departmentName, formData.academicYear, formData.semester, formData.joiningYear]);

  const fetchSubjectsForCurriculum = async () => {
    setLoadingSubjects(true);
    setSubjects([]); // Clear previous subjects to avoid showing stale department data
    try {
      const deptId = formData.departmentId;
      const deptName = formData.departmentName;
      const jYear = parseInt(formData.joiningYear) || 2023;
      const aYear = parseInt(formData.academicYear) || 1;
      const sem = parseInt(formData.semester) || 1;

      const params = {
        departmentId: deptId,
        departmentName: deptName,
        joiningYear: jYear,
        academicYear: aYear,
        semester: sem
      };

      const response = await adminService.getSubjectsByCurriculum(params);
      let subjectList = [];

      if (response && response.success && response.data) {
        const subjectData = response.data;
        if (subjectData.subjects && Array.isArray(subjectData.subjects)) {
          subjectList = subjectData.subjects;
        } else if (Array.isArray(subjectData)) {
          subjectList = subjectData;
        } else if (subjectData.subjectNames && Array.isArray(subjectData.subjectNames)) {
          subjectList = subjectData.subjectNames.map((name, index) => ({
            id: (subjectData.subjectIds && subjectData.subjectIds[index]) || `sub-${index}`,
            name: name
          }));
        }
      }

      // If curriculum lookup had no subjects, try fetching strictly for this target department
      if (subjectList.length === 0 && (deptId || deptName)) {
        try {
          const allSubs = await adminService.getAllSubjects({ department: deptName || deptId, departmentId: deptId });
          if (allSubs && allSubs.success && Array.isArray(allSubs.data)) {
            subjectList = allSubs.data.map(s => ({
              id: s.id,
              name: s.subjectName || s.name
            }));
          }
        } catch (e) {}
      }

      // Deduplicate subjects by clean name
      const uniqueSubjects = [];
      const seenNames = new Set();
      subjectList.forEach(s => {
        const sName = s.name || s.subjectName || (typeof s === 'string' ? s : '');
        if (sName && !seenNames.has(sName.toLowerCase().trim())) {
          seenNames.add(sName.toLowerCase().trim());
          uniqueSubjects.push({
            id: s.id || `sub-${sName}`,
            name: sName,
            subjectName: sName
          });
        }
      });

      setSubjects(uniqueSubjects);
    } catch (error) {
      console.error('Error fetching subjects for target department:', error);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    const selectedDept = departments.find(d => d.id === deptId);
    setSubjects([]); // Immediately clear subjects list for the previous department
    setFormData(prev => ({
      ...prev,
      departmentId: deptId,
      departmentName: selectedDept ? selectedDept.name : '',
      subjectId: '',
      subjectName: ''
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'joiningYear' || name === 'academicYear' || name === 'semester') {
        newData.subjectId = '';
        newData.subjectName = '';
      }
      return newData;
    });
  };

  const handleSubjectChange = (e) => {
    const subjectVal = e.target.value;
    const selectedSubject = subjects.find(s => s.id === subjectVal || s.name === subjectVal);
    setFormData(prev => ({
      ...prev,
      subjectId: selectedSubject ? selectedSubject.id : subjectVal,
      subjectName: selectedSubject ? selectedSubject.name : subjectVal
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        file: file,
        fileName: file.name,
        type: file.type.includes('pdf') ? 'PDF' : 
              file.type.includes('ppt') ? 'PPT' : 
              file.type.includes('doc') ? 'DOC' : 'Other'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    
    if (!formData.departmentName && !formData.departmentId) {
      toast.error('Please select a target Department');
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

    if (!formData.subjectName && !formData.subjectId) {
      toast.error('Please select or specify a subject');
      return;
    }
    
    if (uploadType === 'file' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    
    if (uploadType === 'youtube' && !formData.youTubeUrl) {
      toast.error('Please enter YouTube lecture URL');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      const fieldsToSend = {
        title: formData.title,
        description: formData.description || '',
        department: formData.departmentName || '',
        departmentId: formData.departmentId || '',
        joiningYear: formData.joiningYear || '2023',
        academicYear: formData.academicYear || '1',
        semester: formData.semester || '1',
        subjectId: formData.subjectId || '',
        subjectName: formData.subjectName || '',
        type: formData.type || 'PDF',
        youTubeUrl: formData.youTubeUrl || ''
      };
      
      Object.keys(fieldsToSend).forEach(key => {
        if (fieldsToSend[key] !== null && fieldsToSend[key] !== undefined && fieldsToSend[key] !== '') {
          formDataToSend.append(key, fieldsToSend[key]);
        }
      });

      if (uploadType === 'file' && selectedFile) {
        formDataToSend.append('file', selectedFile);
      }

      const response = await materialService.uploadMaterial(formDataToSend);

      if (response.success) {
        toast.success(`Material uploaded & mapped to ${formData.departmentName} successfully!`);
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          title: '',
          description: '',
          subjectId: '',
          subjectName: '',
          type: 'PDF',
          youTubeUrl: '',
          fileName: ''
        }));
        setSelectedFile(null);
        
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        toast.error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let year = 2020; year <= currentYear + 1; year++) {
      options.push({ value: year.toString(), label: year.toString() });
    }
    return options;
  };

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

  const academicYearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];

  if (loadingInitial) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 sm:p-8">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-2">
            <span>Faculty Multi-Department Publishing Portal</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Study Material</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Publish lecture slides, study notes, question banks, or video references for students across any of your assigned or college departments.
          </p>
        </div>

        {/* Upload Type Switcher */}
        <div className="flex gap-3 mb-6 p-1 bg-slate-50 rounded-xl border border-slate-100">
          <button
            type="button"
            onClick={() => setUploadType('file')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              uploadType === 'file'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <File size={16} />
            Document / Presentation File
          </button>
          <button
            type="button"
            onClick={() => setUploadType('youtube')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              uploadType === 'youtube'
                ? 'bg-white text-red-600 shadow-sm border border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-red-500">▶</span>
            YouTube Lecture Video
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Target Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Department *
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleDepartmentChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
              required
            >
              <option value="">-- Select Target Department --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name} ({dept.code || 'Dept'}) {dept.isAssigned ? '★ Assigned' : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Select the department you are uploading or teaching this material for.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Material Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
              placeholder="e.g. Unit 3: Distributed Systems Architecture"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Description & Topics Covered</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
              rows="3"
              placeholder="Provide a concise summary of topics, chapters, and relevant exam questions included in this resource."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Joining Batch *</label>
              <select
                name="joiningYear"
                value={formData.joiningYear}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                required
              >
                {yearOptions().map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label} Batch</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Academic Year *</label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                required
              >
                {academicYearOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                required
              >
                {semesterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Subject *</label>
            {loadingSubjects ? (
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading curriculum subjects for {formData.departmentName || 'department'}...</span>
              </div>
            ) : subjects.length > 0 ? (
              <select
                name="subjectId"
                value={formData.subjectId || formData.subjectName}
                onChange={handleSubjectChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
                required
              >
                <option value="">-- Select Subject from Curriculum ({subjects.length}) --</option>
                {subjects.map((sub, idx) => {
                  const sName = sub.name || sub.subjectName || (typeof sub === 'string' ? sub : `Subject ${idx + 1}`);
                  const sId = sub.id || sName;
                  return (
                    <option key={sId} value={sId}>{sName}</option>
                  );
                })}
              </select>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>No mapped subjects found for this batch. Type subject name below:</span>
                </div>
                <input
                  type="text"
                  name="subjectName"
                  value={formData.subjectName}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      subjectName: e.target.value,
                      subjectId: `manual-${Date.now()}`
                    }));
                  }}
                  placeholder="Enter subject name manually (e.g. Data Structures)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">File Format *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all cursor-pointer"
            >
              <option value="PDF">PDF Document (.pdf)</option>
              <option value="PPT">Presentation Slides (.ppt, .pptx)</option>
              <option value="DOC">Word Document (.doc, .docx)</option>
              <option value="VIDEO">Video Reference</option>
            </select>
          </div>

          {uploadType === 'file' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Attach Document *</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.ppt,.pptx,.doc,.docx"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <CheckCircle size={22} />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-slate-900">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to upload
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                        <Upload size={22} />
                      </div>
                      <p className="text-sm font-bold text-slate-800">Click to select a file or drag & drop</p>
                      <p className="text-xs text-slate-400 mt-1">PDF, PowerPoint, Word documents (up to 50MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {uploadType === 'youtube' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">YouTube Video Link *</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="youTubeUrl"
                  value={formData.youTubeUrl}
                  onChange={handleInputChange}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.departmentId}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Material...</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Upload & Publish</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterial;