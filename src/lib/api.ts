export type Pagination = { page: number; limit: number; total: number };

export type Doctor = {
  _id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount: number;
};

export type Patient = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  condition: string;
  doctorId: Doctor | string;
  createdAt: string;
  updatedAt: string;
};

export type Dashboard = {
  totalDoctors: number;
  totalPatients: number;
  patientsPerDoctor: {
    doctorId: string;
    doctorName: string;
    patientCount: number;
  }[];
  patientsByDate?: { _id: string; count: number }[];
};

export type DoctorInput = Omit<
  Doctor,
  "_id" | "createdAt" | "updatedAt" | "patientCount"
>;
export type PatientInput = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  condition: string;
  doctorId: string;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Error responses are not required to have a JSON body.
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  dashboard: () => request<{ data: Dashboard }>("/api/dashboard"),
  doctors: (params: URLSearchParams, signal?: AbortSignal) =>
    request<{ data: Doctor[]; pagination: Pagination }>(
      `/api/doctors?${params}`,
      { signal },
    ),
  doctorPatients: (id: string, params: URLSearchParams) =>
    request<{ doctor: Doctor; data: Patient[]; pagination: Pagination }>(
      `/api/doctors/${id}/patients?${params}`,
    ),
  patients: (params: URLSearchParams, signal?: AbortSignal) =>
    request<{ data: Patient[]; pagination: Pagination }>(
      `/api/patients?${params}`,
      { signal },
    ),
  createDoctor: (input: DoctorInput) =>
    request<{ data: Doctor }>("/api/doctors", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updateDoctor: (id: string, input: Partial<DoctorInput>) =>
    request<{ data: Doctor }>(`/api/doctors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deleteDoctor: (id: string) =>
    request<void>(`/api/doctors/${id}`, { method: "DELETE" }),
  createPatient: (doctorId: string, input: Omit<PatientInput, "doctorId">) =>
    request<{ data: Patient }>(`/api/patients/doctor/${doctorId}`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  updatePatient: (id: string, input: Partial<PatientInput>) =>
    request<{ data: Patient }>(`/api/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  deletePatient: (id: string) =>
    request<void>(`/api/patients/${id}`, { method: "DELETE" }),
};
