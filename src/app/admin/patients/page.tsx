"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PatientFormFields } from "@/components/admin-form-fields";
import { DateRangeFilter } from "@/components/date-range-filter";
import { DoctorPicker } from "@/components/doctor-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type Doctor, type Patient, type PatientInput } from "@/lib/api";
import { getUserRole, useSession } from "@/lib/auth-client";
import { patientsQuery } from "@/lib/queries";

const emptyPatient: PatientInput = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  condition: "",
  doctorId: "",
};

function doctorName(patient: Patient) {
  return typeof patient.doctorId === "string"
    ? patient.doctorId
    : patient.doctorId.name;
}

export default function Page() {
  const session = useSession();
  const searchParams = useSearchParams();
  const isAdmin = getUserRole(session.data?.user) === "admin";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [doctorFilter, setDoctorFilter] = useState(
    () => searchParams.get("doctorId") ?? "all",
  );
  const [filterDoctor, setFilterDoctor] = useState<Doctor>();
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<PatientInput>(emptyPatient);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [formDoctor, setFormDoctor] = useState<Doctor>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Patient | null>(null);
  const params = useMemo(() => {
    const value = new URLSearchParams({ page: String(page), limit: "10" });
    if (search.trim()) value.set("search", search.trim());
    if (doctorFilter !== "all") value.set("doctorId", doctorFilter);
    if (from) value.set("from", from);
    if (to) value.set("to", to);
    return value;
  }, [doctorFilter, from, page, search, to]);
  const hasInvalidDateRange = Boolean(from && to && from > to);
  const patients = useQuery(patientsQuery(params, !hasInvalidDateRange));
  const save = useMutation({
    mutationFn: () =>
      editing
        ? api.updatePatient(editing._id, form)
        : api.createPatient(form.doctorId, form),
    onSuccess: () => {
      toast.success(editing ? "Patient updated." : "Patient created.");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deletePatient(id),
    onSuccess: () => {
      toast.success("Patient deleted.");
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const openCreate = () => {
    setEditing(null);
    setForm(emptyPatient);
    setFormDoctor(undefined);
    setDialogOpen(true);
  };
  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth.slice(0, 10),
      condition: patient.condition,
      doctorId:
        typeof patient.doctorId === "string"
          ? patient.doctorId
          : patient.doctorId._id,
    });
    setFormDoctor(
      typeof patient.doctorId === "string" ? undefined : patient.doctorId,
    );
    setDialogOpen(true);
  };

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-muted-foreground">
            Search, filter, and maintain patient records.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <PlusIcon data-icon="inline-start" />
            Add patient
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <div className="flex w-full items-center gap-6 max-w-[60dvw]">
            <InputGroup className="min-w-0 flex-1">
              <InputGroupInput
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email, or condition"
              />
            </InputGroup>
            <DoctorPicker
              value={doctorFilter}
              selectedDoctor={filterDoctor}
              includeAll
              className="w-56"
              onChange={(value, doctor) => {
                setDoctorFilter(value);
                setFilterDoctor(doctor);
                setPage(1);
              }}
            />
            <DateRangeFilter
              from={from}
              to={to}
              onFromChange={(value) => {
                setFrom(value);
                setPage(1);
              }}
              onToChange={(value) => {
                setTo(value);
                setPage(1);
              }}
              onClear={() => {
                setFrom("");
                setTo("");
                setPage(1);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {patients.isPending ? (
            <Skeleton className="h-64 w-full" />
          ) : patients.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load patients</AlertTitle>
              <AlertDescription>{patients.error.message}</AlertDescription>
            </Alert>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date of birth</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.data.data.map((patient) => (
                    <TableRow key={patient._id}>
                      <TableCell className="font-medium">
                        {patient.name}
                      </TableCell>
                      <TableCell>
                        <div>{patient.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {patient.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{patient.condition}</TableCell>
                      <TableCell>{doctorName(patient)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEdit(patient)}
                                aria-label={`Edit ${patient.name}`}
                              >
                                <PencilIcon />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setDeleting(patient)}
                                aria-label={`Delete ${patient.name}`}
                              >
                                <Trash2Icon />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        setPage((value) => Math.max(1, value - 1));
                      }}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive
                      onClick={(event) => event.preventDefault()}
                    >
                      {patients.data.pagination.page}
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        if (
                          page * patients.data.pagination.limit <
                          patients.data.pagination.total
                        )
                          setPage((value) => value + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit patient" : "Add patient"}
            </DialogTitle>
            <DialogDescription>
              Patient information is sent securely to the API.
            </DialogDescription>
          </DialogHeader>
          <PatientFormFields
            value={form}
            selectedDoctor={formDoctor}
            onChange={(value, doctor) => {
              setForm(value);
              setFormDoctor(doctor);
            }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => save.mutate()}
              disabled={save.isPending || !form.doctorId}
            >
              {save.isPending ? "Saving..." : "Save patient"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the patient record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleting && remove.mutate(deleting._id)}
            >
              {remove.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
