import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, credentialsApi, triggersApi, workflowsApi } from '@/lib/api';

export const useSignup = () => {
  return useMutation({
    mutationFn: authApi.signup,
  });
};

export const useSignin = () => {
  return useMutation({
    mutationFn: authApi.signin,
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: authApi.getUser,
    retry: false,
  });
};

export const useCredentials = () => {
  return useQuery({
    queryKey: ['credentials'],
    queryFn: credentialsApi.getAll,
  });
};

export const useCreateCredential = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: credentialsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
    },
  });
};

export const useTriggers = () => {
  return useQuery({
    queryKey: ['triggers'],
    queryFn: triggersApi.getAll,
  });
};

export const useCreateTrigger = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: triggersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triggers'] });
    },
  });
};

export const useWorkflows = () => {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: workflowsApi.getAll,
  });
};

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: ['workflow', id],
    queryFn: () => workflowsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workflowsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};

export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workflowsApi.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', variables.id] });
    },
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: workflowsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
};
