"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DoctorFormFields } from "@/components/admin-form-fields";
import { DateRangeFilter } from "@/components/date-range-filter";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api, type Doctor, type DoctorInput, type Patient } from "@/lib/api";
import { getUserRole, useSession } from "@/lib/auth-client";
import { doctorsQuery, queryKeys } from "@/lib/queries";

const emptyDoctor: DoctorInput = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

type AssignmentFilter = "all" | "assigned" | "unassigned";

export default function Page() {
  const session = useSession();
  const isAdmin = getUserRole(session.data?.user) === "admin";
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [assignment, setAssignment] = useState<AssignmentFilter>("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<DoctorInput>(emptyDoctor);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Doctor | null>(null);
  const [viewing, setViewing] = useState<Doctor | null>(null);
  const [patientPage, setPatientPage] = useState(1);
  const params = useMemo(() => {
    const value = new URLSearchParams({
      page: String(page),
      limit: "10",
      assignment,
    });
    if (search.trim()) value.set("search", search.trim());
    if (from) value.set("from", from);
    if (to) value.set("to", to);
    return value;
  }, [assignment, from, page, search, to]);
  const hasInvalidDateRange = Boolean(from && to && from > to);
  const doctors = useQuery(doctorsQuery(params, !hasInvalidDateRange));
  const patientsParams = new URLSearchParams({
    page: String(patientPage),
    limit: "10",
  });
  const patients = useQuery({
    queryKey: queryKeys.doctorPatients(
      viewing?._id ?? "",
      patientsParams.toString(),
    ),
    queryFn: () => api.doctorPatients(viewing?._id ?? "", patientsParams),
    enabled: Boolean(viewing),
  });
  const save = useMutation({
    mutationFn: () =>
      editing ? api.updateDoctor(editing._id, form) : api.createDoctor(form),
    onSuccess: () => {
      toast.success(editing ? "Doctor updated." : "Doctor created.");
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.deleteDoctor(id),
    onSuccess: () => {
      toast.success("Doctor deleted.");
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const openCreate = () => {
    setEditing(null);
    setForm(emptyDoctor);
    setDialogOpen(true);
  };
  const openEdit = (doctor: Doctor) => {
    setEditing(doctor);
    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      phone: doctor.phone,
      email: doctor.email,
    });
    setDialogOpen(true);
  };

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Doctors</h1>
          <p className="text-muted-foreground">
            Manage providers and their patient lists.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openCreate}>
            <PlusIcon data-icon="inline-start" />
            Add doctor
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <InputGroup className="min-w-0 flex-1 w-full">
            <InputGroupInput
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, specialization, or hospital"
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </CardHeader>
        <div className="flex w-full justify-between items-end gap-4 px-6 ">
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
          <div>
            <Tabs
              value={assignment}
              onValueChange={(value) => {
                if (
                  value === "all" ||
                  value === "assigned" ||
                  value === "unassigned"
                ) {
                  setAssignment(value);
                  setPage(1);
                }
              }}
            >
              <TabsList aria-label="Filter doctors by patient assignment">
                <TabsTrigger value="all">All doctors</TabsTrigger>
                <TabsTrigger value="assigned">Assigned</TabsTrigger>
                <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <CardContent>
          {doctors.isPending ? (
            <Skeleton className="h-64 w-full" />
          ) : doctors.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Could not load doctors</AlertTitle>
              <AlertDescription>{doctors.error.message}</AlertDescription>
            </Alert>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Hospital</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Patients</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.data.data.map((doctor) => (
                    <TableRow key={doctor._id}>
                      <TableCell className="font-medium">
                        {doctor.name}
                      </TableCell>
                      <TableCell>{doctor.specialization}</TableCell>
                      <TableCell>{doctor.hospital}</TableCell>
                      <TableCell>
                        <div>{doctor.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {doctor.phone}
                        </div>
                      </TableCell>
                      <TableCell>{doctor.patientCount}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setViewing(doctor);
                              setPatientPage(1);
                            }}
                            aria-label={`View patients for ${doctor.name}`}
                          >
                            <EyeIcon />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEdit(doctor)}
                                aria-label={`Edit ${doctor.name}`}
                              >
                                <PencilIcon />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => setDeleting(doctor)}
                                aria-label={`Delete ${doctor.name}`}
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
              <div className="flex items-center justify-end w-full">
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
                        {doctors.data.pagination.page}
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          if (
                            page * doctors.data.pagination.limit <
                            doctors.data.pagination.total
                          )
                            setPage((value) => value + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit doctor" : "Add doctor"}</DialogTitle>
            <DialogDescription>
              Keep provider contact details current.
            </DialogDescription>
          </DialogHeader>
          <DoctorFormFields value={form} onChange={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Saving..." : "Save doctor"}
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
              This cannot be undone. Doctors with assigned patients may be
              rejected by the API.
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
      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.name} patients</DialogTitle>
            <DialogDescription>
              Patients currently assigned to this doctor.
            </DialogDescription>
          </DialogHeader>
          {patients.isPending ? (
            <Skeleton className="h-32" />
          ) : patients.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{patients.error.message}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex flex-col gap-2">
              {patients.data.data.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No patients assigned.
                </p>
              ) : (
                patients.data.data.map((patient: Patient) => (
                  <div key={patient._id} className="rounded-md border p-3">
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {patient.condition} · {patient.email}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              Close
            </Button>
            {isAdmin && (
              <Button
                onClick={() => {
                  setViewing(null);
                  window.location.href = `/admin/patients?doctorId=${viewing?._id}`;
                }}
              >
                Manage patients
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
