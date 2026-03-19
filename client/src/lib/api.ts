import { queryClient } from "./queryClient";

const BASE = "/api";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  users: {
    list: () => apiFetch<any[]>("/users"),
    get: (id: string) => apiFetch<any>(`/users/${id}`),
    create: (data: any) => apiFetch<any>("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch<any>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
    team: (managerId: string) => apiFetch<any[]>(`/users/${managerId}/team`),
  },
  auth: {
    login: (username: string, password: string) =>
      apiFetch<any>("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
  },
  inductionTemplates: {
    list: () => apiFetch<any[]>("/induction-templates"),
    create: (data: any) => apiFetch<any>("/induction-templates", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch<any>(`/induction-templates/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<void>(`/induction-templates/${id}`, { method: "DELETE" }),
  },
  induction: {
    get: (userId: string) => apiFetch<any>(`/induction/${userId}`),
    completeItem: (userId: string, data: any) =>
      apiFetch<any>(`/induction/${userId}/complete-item`, { method: "POST", body: JSON.stringify(data) }),
  },
  competencies: {
    list: (departmentType?: string) => apiFetch<any[]>(`/competencies${departmentType ? `?departmentType=${departmentType}` : ""}`),
    createCategory: (data: any) => apiFetch<any>("/competency-categories", { method: "POST", body: JSON.stringify(data) }),
    updateCategory: (id: number, data: any) => apiFetch<any>(`/competency-categories/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteCategory: (id: number) => apiFetch<void>(`/competency-categories/${id}`, { method: "DELETE" }),
    createItem: (data: any) => apiFetch<any>("/competency-items", { method: "POST", body: JSON.stringify(data) }),
    updateItem: (id: number, data: any) => apiFetch<any>(`/competency-items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteItem: (id: number) => apiFetch<void>(`/competency-items/${id}`, { method: "DELETE" }),
  },
  trainingMatrix: {
    list: () => apiFetch<any[]>("/training-matrix"),
    get: (userId: string) => apiFetch<any>(`/training-matrix/${userId}`),
    history: (userId: string) => apiFetch<any[]>(`/training-matrix/history/${userId}`),
    create: (data: any) => apiFetch<any>("/training-matrix", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch<any>(`/training-matrix/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    generateShareToken: (id: number) => apiFetch<{ token: string }>(`/training-matrix/${id}/share`, { method: "POST" }),
    getShared: (token: string) => apiFetch<any>(`/training-matrix/shared/${token}`),
    updateShared: (token: string, data: any) => apiFetch<any>(`/training-matrix/shared/${token}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  standardsSurveys: {
    list: () => apiFetch<any[]>("/standards-surveys"),
    get: (roleId: string) => apiFetch<any>(`/standards-surveys/${roleId}`),
    createRole: (data: any) => apiFetch<any>("/standards-surveys/roles", { method: "POST", body: JSON.stringify(data) }),
    deleteRole: (id: number) => apiFetch<void>(`/standards-surveys/roles/${id}`, { method: "DELETE" }),
    createItem: (data: any) => apiFetch<any>("/standards-surveys/items", { method: "POST", body: JSON.stringify(data) }),
    updateItem: (id: number, data: any) => apiFetch<any>(`/standards-surveys/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteItem: (id: number) => apiFetch<void>(`/standards-surveys/items/${id}`, { method: "DELETE" }),
  },
  resources: {
    list: () => apiFetch<any[]>("/resources"),
    create: (data: any) => apiFetch<any>("/resources", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch<any>(`/resources/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<void>(`/resources/${id}`, { method: "DELETE" }),
  },
  certificateDefinitions: {
    list: () => apiFetch<any[]>("/certificate-definitions"),
    create: (data: any) => apiFetch<any>("/certificate-definitions", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch<any>(`/certificate-definitions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<void>(`/certificate-definitions/${id}`, { method: "DELETE" }),
  },
  userCertificates: {
    list: (userId?: string) => apiFetch<any[]>(`/user-certificates${userId ? `?userId=${userId}` : ""}`),
    create: (data: any) => apiFetch<any>("/user-certificates", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<void>(`/user-certificates/${id}`, { method: "DELETE" }),
  },
  careerMilestones: {
    list: (userId: string) => apiFetch<any[]>(`/career-milestones/${userId}`),
    create: (data: any) => apiFetch<any>("/career-milestones", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch<any>(`/career-milestones/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<void>(`/career-milestones/${id}`, { method: "DELETE" }),
  },
  careerNodes: {
    list: () => apiFetch<any[]>("/career-nodes"),
    create: (data: any) => apiFetch<any>("/career-nodes", { method: "POST", body: JSON.stringify(data) }),
  },
  trainingRecords: {
    list: (userId?: string) => apiFetch<any[]>(`/training-records${userId ? `?userId=${userId}` : ""}`),
    create: (data: any) => apiFetch<any>("/training-records", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch<any>(`/training-records/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  jobRoles: {
    list: () => apiFetch<any[]>("/job-roles"),
    create: (data: any) => apiFetch<any>("/job-roles", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch<any>(`/job-roles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => apiFetch<void>(`/job-roles/${id}`, { method: "DELETE" }),
    reorder: (data: { id: number; reportsTo?: number | null; sortOrder?: number }) =>
      apiFetch<any>("/job-roles/reorder", { method: "PATCH", body: JSON.stringify(data) }),
    getCategories: (id: number) => apiFetch<number[]>(`/job-roles/${id}/categories`),
    setCategories: (id: number, categoryIds: number[]) =>
      apiFetch<{ success: boolean }>(`/job-roles/${id}/categories`, { method: "PUT", body: JSON.stringify({ categoryIds }) }),
  },
  departments: {
    list: () => apiFetch<any[]>("/departments"),
    create: (data: any) => apiFetch<any>("/departments", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: any) => apiFetch<any>(`/departments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    rename: (id: number, name: string) => apiFetch<any>(`/departments/${id}/rename`, { method: "PATCH", body: JSON.stringify({ name }) }),
    delete: (id: number) => apiFetch<void>(`/departments/${id}`, { method: "DELETE" }),
  },
  inductionSectionSettings: {
    list: () => apiFetch<any[]>("/induction-section-settings"),
    upsert: (data: { sectionName: string; isUniversal: boolean }) =>
      apiFetch<any>("/induction-section-settings", { method: "PUT", body: JSON.stringify(data) }),
  },
  jobRoleInductionSections: {
    get: (roleId: number) => apiFetch<string[]>(`/job-roles/${roleId}/induction-sections`),
    set: (roleId: number, sections: string[]) =>
      apiFetch<{ success: boolean }>(`/job-roles/${roleId}/induction-sections`, { method: "PUT", body: JSON.stringify({ sections }) }),
  },
  competenciesForRole: {
    get: (jobRole: string) => apiFetch<any[] | null>(`/competencies-for-role?jobRole=${encodeURIComponent(jobRole)}`),
  },
  exportCsv: (type: string) => {
    window.open(`${BASE}/export/${type}`, "_blank");
  },
  importCsv: (type: string, rows: any[]) =>
    apiFetch<{ created: number; skipped: number; colleaguesUpdated?: number; errors: string[] }>(`/import/${type}`, {
      method: "POST",
      body: JSON.stringify({ rows }),
    }),
};

export function invalidate(...keys: string[]) {
  for (const key of keys) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
}
