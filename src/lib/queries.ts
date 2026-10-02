import { queryOptions } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  doctors: (params: string) => ["doctors", params] as const,
  doctorPatients: (id: string, params: string) =>
    ["doctors", id, "patients", params] as const,
  patients: (params: string) => ["patients", params] as const,
};

export const dashboardQuery = () =>
  queryOptions({
    queryKey: queryKeys.dashboard,
    queryFn: api.dashboard,
    staleTime: 60_000,
  });

export const doctorsQuery = (params: URLSearchParams, enabled = true) => {
  const serialized = params.toString();
  return queryOptions({
    queryKey: queryKeys.doctors(serialized),
    queryFn: ({ signal }) => api.doctors(params, signal),
    enabled,
  });
};

export const patientsQuery = (params: URLSearchParams, enabled = true) => {
  const serialized = params.toString();
  return queryOptions({
    queryKey: queryKeys.patients(serialized),
    queryFn: ({ signal }) => api.patients(params, signal),
    enabled,
  });
};
