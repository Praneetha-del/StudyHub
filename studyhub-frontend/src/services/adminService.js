import api from './api';

const adminService = {
  // ==================== DASHBOARD ====================
  getStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const qStr = queryParams.toString();
      const response = await api.get(`/admin/stats${qStr ? `?${qStr}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('❌ getStats error:', error);
      throw error;
    }
  },

  getAdminStats: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const qStr = queryParams.toString();
      const response = await api.get(`/admin/stats${qStr ? `?${qStr}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('❌ getAdminStats error:', error);
      throw error;
    }
  },

  // ==================== USER MANAGEMENT ====================
  getAllUsers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/admin/users?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getAllUsers error:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ getUserById error:', error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/admin/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ updateUser error:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteUser error:', error);
      throw error;
    }
  },

  approveUser: async (id) => {
    try {
      const response = await api.put(`/admin/users/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('❌ approveUser error:', error);
      throw error;
    }
  },

  getPendingTeachers: async () => {
    try {
      const response = await api.get('/admin/teachers/pending');
      return response.data;
    } catch (error) {
      console.error('❌ getPendingTeachers error:', error);
      throw error;
    }
  },

  approveTeacher: async (id) => {
    try {
      const response = await api.put(`/admin/teachers/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('❌ approveTeacher error:', error);
      throw error;
    }
  },

  rejectTeacher: async (id, reason) => {
    try {
      const response = await api.put(`/admin/teachers/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('❌ rejectTeacher error:', error);
      throw error;
    }
  },

  // ==================== MATERIAL MANAGEMENT ====================
  getAllMaterials: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/admin/materials?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getAllMaterials error:', error);
      throw error;
    }
  },

  blockMaterial: async (id, notes) => {
    try {
      const response = await api.put(`/admin/materials/${id}/block`, { notes });
      return response.data;
    } catch (error) {
      console.error('❌ blockMaterial error:', error);
      throw error;
    }
  },

  unblockMaterial: async (id) => {
    try {
      const response = await api.put(`/admin/materials/${id}/unblock`);
      return response.data;
    } catch (error) {
      console.error('❌ unblockMaterial error:', error);
      throw error;
    }
  },

  deleteMaterial: async (id) => {
    try {
      const response = await api.delete(`/admin/materials/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteMaterial error:', error);
      throw error;
    }
  },

  // ==================== CURRICULUM MANAGEMENT ====================
  // ===== REGULATIONS =====
  getAllRegulations: async () => {
    try {
      const response = await api.get('/admin/regulations');
      return response.data;
    } catch (error) {
      console.error('❌ getAllRegulations error:', error);
      throw error;
    }
  },

  createRegulation: async (data) => {
    try {
      const response = await api.post('/admin/regulations', data);
      return response.data;
    } catch (error) {
      console.error('❌ createRegulation error:', error);
      throw error;
    }
  },

  updateRegulation: async (id, data) => {
    try {
      const response = await api.put(`/admin/regulations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ updateRegulation error:', error);
      throw error;
    }
  },

  deleteRegulation: async (id) => {
    try {
      const response = await api.delete(`/admin/regulations/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteRegulation error:', error);
      throw error;
    }
  },

  // ===== DEPARTMENTS =====
  getAllDepartments: async () => {
    try {
      const response = await api.get('/admin/departments');
      return response.data;
    } catch (error) {
      console.error('❌ getAllDepartments error:', error);
      throw error;
    }
  },

  // ✅ PUBLIC departments - used by teachers/students
  getPublicDepartments: async () => {
    try {
      const response = await api.get('/departments/public');
      return response.data;
    } catch (error) {
      console.error('❌ getPublicDepartments error:', error);
      throw error;
    }
  },

  createDepartment: async (data) => {
    try {
      const response = await api.post('/admin/departments', data);
      return response.data;
    } catch (error) {
      console.error('❌ createDepartment error:', error);
      throw error;
    }
  },

  updateDepartment: async (id, data) => {
    try {
      const response = await api.put(`/admin/departments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ updateDepartment error:', error);
      throw error;
    }
  },

  deleteDepartment: async (id) => {
    try {
      const response = await api.delete(`/admin/departments/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteDepartment error:', error);
      throw error;
    }
  },

  // ===== SUBJECTS =====
  getAllSubjects: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/admin/subjects?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getAllSubjects error:', error);
      throw error;
    }
  },

  createSubject: async (data) => {
    try {
      const response = await api.post('/admin/subjects', data);
      return response.data;
    } catch (error) {
      console.error('❌ createSubject error:', error);
      throw error;
    }
  },

  updateSubject: async (id, data) => {
    try {
      const response = await api.put(`/admin/subjects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ updateSubject error:', error);
      throw error;
    }
  },

  deleteSubject: async (id) => {
    try {
      const response = await api.delete(`/admin/subjects/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteSubject error:', error);
      throw error;
    }
  },

  // ===== CURRICULUM =====
  getAllCurriculums: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const qStr = queryParams.toString();
      const response = await api.get(`/admin/curriculum${qStr ? `?${qStr}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('❌ getAllCurriculums error:', error);
      throw error;
    }
  },

  // ✅ PUBLIC curriculums - used by teachers/students
  getPublicCurriculums: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/curriculum/public?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getPublicCurriculums error:', error);
      throw error;
    }
  },

  // ✅ FIXED: Get subjects by curriculum
  getSubjectsByCurriculum: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });

      console.log('🔍 Fetching subjects with params:', params);
      console.log('🔍 Query string:', queryParams.toString());

      const response = await api.get(`/curriculum/subjects?${queryParams.toString()}`);

      console.log('✅ Subjects response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getSubjectsByCurriculum error:', error);
      console.error('❌ Error details:', error.response?.data || error.message);
      throw error;
    }
  },

  getCurriculumById: async (id) => {
    try {
      const response = await api.get(`/admin/curriculum/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ getCurriculumById error:', error);
      throw error;
    }
  },

  createCurriculum: async (data) => {
    try {
      const response = await api.post('/admin/curriculum', data);
      return response.data;
    } catch (error) {
      console.error('❌ createCurriculum error:', error);
      throw error;
    }
  },

  updateCurriculum: async (id, data) => {
    try {
      const response = await api.put(`/admin/curriculum/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('❌ updateCurriculum error:', error);
      throw error;
    }
  },

  deleteCurriculum: async (id) => {
    try {
      const response = await api.delete(`/admin/curriculum/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteCurriculum error:', error);
      throw error;
    }
  },

  getFilteredCurriculums: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/curriculum/filter?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getFilteredCurriculums error:', error);
      throw error;
    }
  },

  // ==================== ADD MISSING METHODS ====================
  
  // ✅ Get departments (alias for getPublicDepartments)
  getDepartments: async () => {
    try {
      const response = await api.get('/departments/public');
      return response.data;
    } catch (error) {
      console.error('❌ getDepartments error:', error);
      throw error;
    }
  },

  // ✅ Get departments with admin access
  getAdminDepartments: async () => {
    try {
      const response = await api.get('/admin/departments');
      return response.data;
    } catch (error) {
      console.error('❌ getAdminDepartments error:', error);
      throw error;
    }
  },

  // ✅ Get curriculum by department and semester
  getCurriculumByDepartmentAndSemester: async (departmentId, semester) => {
    try {
      const response = await api.get(`/curriculum/department/${departmentId}/semester/${semester}`);
      return response.data;
    } catch (error) {
      console.error('❌ getCurriculumByDepartmentAndSemester error:', error);
      throw error;
    }
  },

  // ✅ Get subjects by department
  getSubjectsByDepartment: async (departmentId) => {
    try {
      const response = await api.get(`/admin/subjects?departmentId=${departmentId}`);
      return response.data;
    } catch (error) {
      console.error('❌ getSubjectsByDepartment error:', error);
      throw error;
    }
  },

  // ✅ Get user stats
  getUserStats: async () => {
    try {
      const response = await api.get('/admin/users/stats');
      return response.data;
    } catch (error) {
      console.error('❌ getUserStats error:', error);
      throw error;
    }
  },

  // ✅ Get material stats
  getMaterialStats: async () => {
    try {
      const response = await api.get('/admin/materials/stats');
      return response.data;
    } catch (error) {
      console.error('❌ getMaterialStats error:', error);
      throw error;
    }
  },

  // ✅ Bulk approve users
  bulkApproveUsers: async (userIds) => {
    try {
      const response = await api.put('/admin/users/bulk-approve', { userIds });
      return response.data;
    } catch (error) {
      console.error('❌ bulkApproveUsers error:', error);
      throw error;
    }
  },

  // ✅ Bulk delete users
  bulkDeleteUsers: async (userIds) => {
    try {
      const response = await api.delete('/admin/users/bulk-delete', { data: { userIds } });
      return response.data;
    } catch (error) {
      console.error('❌ bulkDeleteUsers error:', error);
      throw error;
    }
  },

  // ==================== TEACHER ASSIGNMENTS ====================
  // ✅ Get all teacher assignments (Admin)
  getTeacherAssignments: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/admin/teacher-assignments?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getTeacherAssignments error:', error);
      throw error;
    }
  },

  // ✅ Create teacher assignment (Admin)
  createTeacherAssignment: async (data) => {
    try {
      const response = await api.post('/admin/teacher-assignments', data);
      return response.data;
    } catch (error) {
      console.error('❌ createTeacherAssignment error:', error);
      throw error;
    }
  },

  // ✅ Delete teacher assignment (Admin)
  deleteTeacherAssignment: async (id) => {
    try {
      const response = await api.delete(`/admin/teacher-assignments/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ deleteTeacherAssignment error:', error);
      throw error;
    }
  },

  // ✅ Get departments assigned to current logged-in teacher
  getTeacherAssignedDepartments: async () => {
    try {
      const response = await api.get('/teacher/assigned-departments');
      return response.data;
    } catch (error) {
      console.error('❌ getTeacherAssignedDepartments error:', error);
      throw error;
    }
  },

  // ✅ Get assignments for current logged-in teacher
  getMyTeacherAssignments: async () => {
    try {
      const response = await api.get('/teacher/assignments');
      return response.data;
    } catch (error) {
      console.error('❌ getMyTeacherAssignments error:', error);
      throw error;
    }
  },

  // ✅ Get teachers for subject curriculum mapping
  getTeachersForSubjectCurriculum: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          queryParams.append(key, params[key]);
        }
      });
      const response = await api.get(`/curriculum/teachers-for-subject?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('❌ getTeachersForSubjectCurriculum error:', error);
      throw error;
    }
  }
};

export default adminService;