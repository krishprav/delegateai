import axios from 'axios';
import { BACKEND_URL } from '@/config/api';
import type { CredentialSubmitPayload, Workflow } from '@delegate/db';

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  signup: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/v1/auth/signup', data);
    return response.data;
  },
  
  signin: async (data: { email: string; password: string }) => {
    const response = await api.post('/api/v1/auth/signin', data);
    return response.data;
  },
  
  getUser: async () => {
    const response = await api.get('/api/v1/auth/me');
    return response.data;
  },
};

// Credentials API
export const credentialsApi = {
  getAll: async () => {
    const response = await api.get('/api/v1/cred/all');
    return response.data;
  },
  
  create: async (data: CredentialSubmitPayload) => {
    const response = await api.post('/api/v1/cred/save', data);
    return response.data;
  },
};

// Triggers API
export const triggersApi = {
  getAll: async () => {
    const response = await api.get('/api/v1/triggers');
    return response.data;
  },
  
  create: async (data: { name: string; type: string; description: string }) => {
    const response = await api.post('/api/v1/triggers/create', data);
    return response.data;
  },
};

// Workflows API
export const workflowsApi = {
  getAll: async () => {
    const response = await api.post('/api/v1/workflow/getAllWorkflows');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/v1/workflow/${id}`);
    return response.data;
  },
  
  create: async (data: Partial<Workflow>) => {
    const response = await api.post('/api/v1/workflow', data);
    return response.data;
  },
  
  update: async ({ id, data }: { id: string; data: Partial<Workflow> }) => {
    const response = await api.put(`/api/v1/workflow/${id}`, data);
    return response.data;
  },
  
  delete: async (id: string) => {
    const response = await api.delete(`/api/v1/workflow/${id}`);
    return response.data;
  },
};

export default api;
