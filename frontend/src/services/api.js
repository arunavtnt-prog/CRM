/**
 * API Service for Wavelaunch Studio OS
 * Handles all backend API communication
 * Epic 2: Project Lifecycle Visibility & Tracking
 */

import axios from 'axios';

const API_BASE_URL = '/api/crm';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/admin/login/';
    }
    return Promise.reject(error);
  }
);

// ===== DASHBOARD API (Epic 0.3) =====

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/');
  return response.data;
};

export const getHealthSummary = async () => {
  const response = await api.get('/dashboard/health_summary/');
  return response.data;
};

export const getStatusSummary = async () => {
  const response = await api.get('/dashboard/status_summary/');
  return response.data;
};

// ===== CREATORS API (Epic 1 & 2) =====

export const getCreators = async (params = {}) => {
  const response = await api.get('/creators/', { params });
  return response.data;
};

export const getCreator = async (id) => {
  const response = await api.get(`/creators/${id}/`);
  return response.data;
};

export const createCreator = async (data) => {
  const response = await api.post('/creators/', data);
  return response.data;
};

export const updateCreator = async (id, data) => {
  const response = await api.patch(`/creators/${id}/`, data);
  return response.data;
};

export const deleteCreator = async (id) => {
  const response = await api.delete(`/creators/${id}/`);
  return response.data;
};

// Story 2.2: Change Journey Status
export const updateJourneyStatus = async (id, journeyStatus, notes = '') => {
  const response = await api.post(`/creators/${id}/update_journey_status/`, {
    journey_status: journeyStatus,
    notes,
  });
  return response.data;
};

// Story 2.4: Get urgent projects
export const getUrgentCreators = async () => {
  const response = await api.get('/creators/urgent/');
  return response.data;
};

// Get creators grouped by status
export const getCreatorsByStatus = async () => {
  const response = await api.get('/creators/by_status/');
  return response.data;
};

// ===== MILESTONES API (Story 2.1) =====

export const getMilestones = async (params = {}) => {
  const response = await api.get('/milestones/', { params });
  return response.data;
};

export const getMilestonesByCreator = async (creatorId) => {
  const response = await api.get(`/milestones/by_creator/?creator_id=${creatorId}`);
  return response.data;
};

export const createMilestone = async (data) => {
  const response = await api.post('/milestones/', data);
  return response.data;
};

export const updateMilestone = async (id, data) => {
  const response = await api.patch(`/milestones/${id}/`, data);
  return response.data;
};

export const markMilestoneComplete = async (id) => {
  const response = await api.post(`/milestones/${id}/mark_complete/`);
  return response.data;
};

export const deleteMilestone = async (id) => {
  const response = await api.delete(`/milestones/${id}/`);
  return response.data;
};

// ===== CREDENTIALS API (Story 1.4) =====

export const getCredentials = async (creatorId) => {
  const response = await api.get('/credentials/', {
    params: { creator_id: creatorId },
  });
  return response.data;
};

export const createCredential = async (data) => {
  const response = await api.post('/credentials/', data);
  return response.data;
};

export const updateCredential = async (id, data) => {
  const response = await api.patch(`/credentials/${id}/`, data);
  return response.data;
};

export const deleteCredential = async (id) => {
  const response = await api.delete(`/credentials/${id}/`);
  return response.data;
};

// ===== AUDIT LOGS API (Epic 0.4) =====

export const getAuditLogs = async (params = {}) => {
  const response = await api.get('/audit-logs/', { params });
  return response.data;
};

export const getRecentAuditLogs = async () => {
  const response = await api.get('/audit-logs/recent/');
  return response.data;
};

export const getCreatorAuditLogs = async (creatorId) => {
  const response = await api.get(`/audit-logs/by_creator/?creator_id=${creatorId}`);
  return response.data;
};

// ===== AI DELIVERABLES API (Epic 3) =====

export const getDeliverables = async (params = {}) => {
  const response = await api.get('/deliverables/', { params });
  return response.data;
};

export const createDeliverable = async (data) => {
  const response = await api.post('/deliverables/', data);
  return response.data;
};

export default api;
