import api from './api';

export const queryService = {
  // Create a new doubt / query
  createQuery: async (queryData) => {
    try {
      const response = await api.post('/queries', queryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get queries submitted by the logged in student
  getMyQueries: async () => {
    try {
      const response = await api.get('/queries/my-queries');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get queries for the logged in teacher
  getTeacherQueries: async (status = '') => {
    try {
      const url = status ? `/queries/teacher-queries?status=${status}` : '/queries/teacher-queries';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single query by ID
  getQueryById: async (id) => {
    try {
      const response = await api.get(`/queries/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Teacher replies to query
  replyToQuery: async (id, replyData) => {
    try {
      const response = await api.post(`/queries/${id}/reply`, replyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Mark query as resolved
  resolveQuery: async (id) => {
    try {
      const response = await api.put(`/queries/${id}/resolve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Auto-identify teachers for subject
  getTeachersForSubject: async (params) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.subjectName) queryParams.append('subjectName', params.subjectName);
      if (params.subjectId) queryParams.append('subjectId', params.subjectId);
      if (params.department) queryParams.append('department', params.department);
      if (params.departmentId) queryParams.append('departmentId', params.departmentId);
      if (params.academicYear) queryParams.append('academicYear', params.academicYear);
      if (params.semester) queryParams.append('semester', params.semester);
      if (params.regulation) queryParams.append('regulation', params.regulation);

      const response = await api.get(`/queries/teachers-by-subject?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get query counts/stats
  getQueryStats: async () => {
    try {
      const response = await api.get('/queries/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default queryService;
