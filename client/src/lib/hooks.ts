import { useQuery, useMutation } from "@tanstack/react-query";
import { api, invalidate } from "./api";

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: api.users.list });
}

export function useUser(id: string) {
  return useQuery({ queryKey: ["users", id], queryFn: () => api.users.get(id), enabled: !!id });
}

export function useTeamMembers(managerId: string) {
  return useQuery({ queryKey: ["team", managerId], queryFn: () => api.users.team(managerId), enabled: !!managerId });
}

export function useInductionTemplates() {
  return useQuery({ queryKey: ["induction-templates"], queryFn: api.inductionTemplates.list });
}

export function useInduction(userId: string) {
  return useQuery({ queryKey: ["induction", userId], queryFn: () => api.induction.get(userId), enabled: !!userId });
}

export function useCompleteInductionItem(userId: string) {
  return useMutation({
    mutationFn: (data: any) => api.induction.completeItem(userId, data),
    onSuccess: () => invalidate("induction"),
  });
}

export function useCompetencies(departmentType?: string) {
  return useQuery({ queryKey: ["competencies", departmentType], queryFn: () => api.competencies.list(departmentType) });
}

export function useTrainingMatrixSubmissions() {
  return useQuery({ queryKey: ["training-matrix"], queryFn: api.trainingMatrix.list });
}

export function useTrainingMatrixForUser(userId: string) {
  return useQuery({ queryKey: ["training-matrix", userId], queryFn: () => api.trainingMatrix.get(userId), enabled: !!userId });
}

export function useCreateTrainingMatrix() {
  return useMutation({
    mutationFn: (data: any) => api.trainingMatrix.create(data),
    onSuccess: () => invalidate("training-matrix"),
  });
}

export function useUpdateTrainingMatrix() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.trainingMatrix.update(id, data),
    onSuccess: () => invalidate("training-matrix"),
  });
}

export function useStandardsSurveys() {
  return useQuery({ queryKey: ["standards-surveys"], queryFn: api.standardsSurveys.list });
}

export function useStandardsSurvey(roleId: string) {
  return useQuery({ queryKey: ["standards-surveys", roleId], queryFn: () => api.standardsSurveys.get(roleId), enabled: !!roleId });
}

export function useResources() {
  return useQuery({ queryKey: ["resources"], queryFn: api.resources.list });
}

export function useCreateResource() {
  return useMutation({
    mutationFn: (data: any) => api.resources.create(data),
    onSuccess: () => invalidate("resources"),
  });
}

export function useUpdateResource() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.resources.update(id, data),
    onSuccess: () => invalidate("resources"),
  });
}

export function useDeleteResource() {
  return useMutation({
    mutationFn: (id: number) => api.resources.delete(id),
    onSuccess: () => invalidate("resources"),
  });
}

export function useCertificateDefinitions() {
  return useQuery({ queryKey: ["certificate-definitions"], queryFn: api.certificateDefinitions.list });
}

export function useCreateCertificateDefinition() {
  return useMutation({
    mutationFn: (data: any) => api.certificateDefinitions.create(data),
    onSuccess: () => invalidate("certificate-definitions"),
  });
}

export function useUpdateCertificateDefinition() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.certificateDefinitions.update(id, data),
    onSuccess: () => invalidate("certificate-definitions"),
  });
}

export function useDeleteCertificateDefinition() {
  return useMutation({
    mutationFn: (id: number) => api.certificateDefinitions.delete(id),
    onSuccess: () => invalidate("certificate-definitions"),
  });
}

export function useUserCertificates(userId?: string) {
  return useQuery({ queryKey: ["user-certificates", userId], queryFn: () => api.userCertificates.list(userId) });
}

export function useCreateUserCertificate() {
  return useMutation({
    mutationFn: (data: any) => api.userCertificates.create(data),
    onSuccess: () => invalidate("user-certificates"),
  });
}

export function useCareerMilestones(userId: string) {
  return useQuery({ queryKey: ["career-milestones", userId], queryFn: () => api.careerMilestones.list(userId), enabled: !!userId });
}

export function useCareerNodes() {
  return useQuery({ queryKey: ["career-nodes"], queryFn: api.careerNodes.list });
}

export function useTrainingRecords(userId?: string) {
  return useQuery({ queryKey: ["training-records", userId], queryFn: () => api.trainingRecords.list(userId) });
}

export function useJobRoles() {
  return useQuery({ queryKey: ["job-roles"], queryFn: api.jobRoles.list });
}

export function useCreateJobRole() {
  return useMutation({
    mutationFn: (data: any) => api.jobRoles.create(data),
    onSuccess: () => invalidate("job-roles"),
  });
}

export function useUpdateJobRole() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.jobRoles.update(id, data),
    onSuccess: () => invalidate("job-roles"),
  });
}

export function useDeleteJobRole() {
  return useMutation({
    mutationFn: (id: number) => api.jobRoles.delete(id),
    onSuccess: () => invalidate("job-roles"),
  });
}

export function useCreateUser() {
  return useMutation({
    mutationFn: (data: any) => api.users.create(data),
    onSuccess: () => invalidate("users"),
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.users.update(id, data),
    onSuccess: () => invalidate("users"),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => invalidate("users"),
  });
}

export function useCreateInductionTemplate() {
  return useMutation({
    mutationFn: (data: any) => api.inductionTemplates.create(data),
    onSuccess: () => invalidate("induction-templates"),
  });
}

export function useUpdateInductionTemplate() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.inductionTemplates.update(id, data),
    onSuccess: () => invalidate("induction-templates"),
  });
}

export function useDeleteInductionTemplate() {
  return useMutation({
    mutationFn: (id: number) => api.inductionTemplates.delete(id),
    onSuccess: () => invalidate("induction-templates"),
  });
}

export function useCreateStandardsSurveyItem() {
  return useMutation({
    mutationFn: (data: any) => api.standardsSurveys.createItem(data),
    onSuccess: () => invalidate("standards-surveys"),
  });
}

export function useUpdateStandardsSurveyItem() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.standardsSurveys.updateItem(id, data),
    onSuccess: () => invalidate("standards-surveys"),
  });
}

export function useDeleteStandardsSurveyItem() {
  return useMutation({
    mutationFn: (id: number) => api.standardsSurveys.deleteItem(id),
    onSuccess: () => invalidate("standards-surveys"),
  });
}
