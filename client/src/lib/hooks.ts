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

export function useCreateCompetencyCategory() {
  return useMutation({
    mutationFn: (data: any) => api.competencies.createCategory(data),
    onSuccess: () => invalidate("competencies"),
  });
}

export function useUpdateCompetencyCategory() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.competencies.updateCategory(id, data),
    onSuccess: () => invalidate("competencies"),
  });
}

export function useDeleteCompetencyCategory() {
  return useMutation({
    mutationFn: (id: number) => api.competencies.deleteCategory(id),
    onSuccess: () => invalidate("competencies"),
  });
}

export function useCreateCompetencyItem() {
  return useMutation({
    mutationFn: (data: any) => api.competencies.createItem(data),
    onSuccess: () => invalidate("competencies"),
  });
}

export function useUpdateCompetencyItem() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.competencies.updateItem(id, data),
    onSuccess: () => invalidate("competencies"),
  });
}

export function useDeleteCompetencyItem() {
  return useMutation({
    mutationFn: (id: number) => api.competencies.deleteItem(id),
    onSuccess: () => invalidate("competencies"),
  });
}

export function useTrainingMatrixSubmissions() {
  return useQuery({ queryKey: ["training-matrix"], queryFn: api.trainingMatrix.list });
}

export function useTrainingMatrixForUser(userId: string) {
  return useQuery({ queryKey: ["training-matrix", userId], queryFn: () => api.trainingMatrix.get(userId), enabled: !!userId });
}

export function useTrainingMatrixHistory(userId: string) {
  return useQuery({ queryKey: ["training-matrix-history", userId], queryFn: () => api.trainingMatrix.history(userId), enabled: !!userId });
}

export function useCreateTrainingMatrix() {
  return useMutation({
    mutationFn: (data: any) => api.trainingMatrix.create(data),
    onSuccess: () => invalidate("training-matrix", "training-matrix-history"),
  });
}

export function useUpdateTrainingMatrix() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.trainingMatrix.update(id, data),
    onSuccess: () => invalidate("training-matrix", "training-matrix-history"),
  });
}

export function useStandardsSurveys() {
  return useQuery({ queryKey: ["standards-surveys"], queryFn: api.standardsSurveys.list });
}

export function useStandardsSurvey(roleId: string) {
  return useQuery({ queryKey: ["standards-surveys", roleId], queryFn: () => api.standardsSurveys.get(roleId), enabled: !!roleId });
}

export function useCreateStandardsSurveyRole() {
  return useMutation({
    mutationFn: (data: any) => api.standardsSurveys.createRole(data),
    onSuccess: () => invalidate("standards-surveys"),
  });
}

export function useDeleteStandardsSurveyRole() {
  return useMutation({
    mutationFn: (id: number) => api.standardsSurveys.deleteRole(id),
    onSuccess: () => invalidate("standards-surveys"),
  });
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

export function useCreateCareerMilestone() {
  return useMutation({
    mutationFn: (data: any) => api.careerMilestones.create(data),
    onSuccess: () => invalidate("career-milestones"),
  });
}

export function useUpdateCareerMilestone() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.careerMilestones.update(id, data),
    onSuccess: () => invalidate("career-milestones"),
  });
}

export function useDeleteCareerMilestone() {
  return useMutation({
    mutationFn: (id: number) => api.careerMilestones.delete(id),
    onSuccess: () => invalidate("career-milestones"),
  });
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

export function useReorderJobRole() {
  return useMutation({
    mutationFn: (data: { id: number; reportsTo?: number | null; sortOrder?: number }) => api.jobRoles.reorder(data),
    onSuccess: () => invalidate("job-roles"),
  });
}

export function useGenerateShareToken() {
  return useMutation({
    mutationFn: (id: number) => api.trainingMatrix.generateShareToken(id),
  });
}

export function useSharedTrainingMatrix(token: string) {
  return useQuery({
    queryKey: ["shared-training-matrix", token],
    queryFn: () => api.trainingMatrix.getShared(token),
    enabled: !!token,
  });
}

export function useUpdateSharedTrainingMatrix() {
  return useMutation({
    mutationFn: ({ token, data }: { token: string; data: any }) => api.trainingMatrix.updateShared(token, data),
    onSuccess: () => invalidate("shared-training-matrix"),
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

export function useJobRoleCategories(roleId: number) {
  return useQuery({
    queryKey: ["job-role-categories", roleId],
    queryFn: () => api.jobRoles.getCategories(roleId),
    enabled: !!roleId,
  });
}

export function useSetJobRoleCategories() {
  return useMutation({
    mutationFn: ({ id, categoryIds }: { id: number; categoryIds: number[] }) =>
      api.jobRoles.setCategories(id, categoryIds),
    onSuccess: () => {
      invalidate("job-role-categories");
      invalidate("job-roles");
    },
  });
}

export function useCompetenciesForRole(jobRole: string | undefined) {
  return useQuery({
    queryKey: ["competencies-for-role", jobRole],
    queryFn: () => api.competenciesForRole.get(jobRole!),
    enabled: !!jobRole,
  });
}

export function useDeleteStandardsSurveyItem() {
  return useMutation({
    mutationFn: (id: number) => api.standardsSurveys.deleteItem(id),
    onSuccess: () => invalidate("standards-surveys"),
  });
}

export function useInductionSectionSettings() {
  return useQuery({ queryKey: ["induction-section-settings"], queryFn: api.inductionSectionSettings.list });
}

export function useUpsertInductionSectionSetting() {
  return useMutation({
    mutationFn: (data: { sectionName: string; isUniversal: boolean }) => api.inductionSectionSettings.upsert(data),
    onSuccess: () => invalidate("induction-section-settings"),
  });
}

export function useJobRoleInductionSections(roleId: number) {
  return useQuery({
    queryKey: ["job-role-induction-sections", roleId],
    queryFn: () => api.jobRoleInductionSections.get(roleId),
    enabled: !!roleId,
  });
}

export function useSetJobRoleInductionSections() {
  return useMutation({
    mutationFn: ({ id, sections }: { id: number; sections: string[] }) => api.jobRoleInductionSections.set(id, sections),
    onSuccess: () => invalidate("job-role-induction-sections"),
  });
}

export function useDepartments() {
  return useQuery({ queryKey: ["departments"], queryFn: api.departments.list });
}

export function useCreateDepartment() {
  return useMutation({
    mutationFn: (data: any) => api.departments.create(data),
    onSuccess: () => invalidate("departments"),
  });
}

export function useUpdateDepartment() {
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) => api.departments.update(id, data),
    onSuccess: () => invalidate("departments"),
  });
}

export function useRenameDepartment() {
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => api.departments.rename(id, name),
    onSuccess: () => {
      invalidate("departments");
      invalidate("job-roles");
      invalidate("competencies");
      invalidate("users");
      invalidate("career-nodes");
    },
  });
}

export function useDeleteDepartment() {
  return useMutation({
    mutationFn: (id: number) => api.departments.delete(id),
    onSuccess: () => invalidate("departments"),
  });
}
