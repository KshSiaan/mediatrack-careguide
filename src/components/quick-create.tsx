"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, StethoscopeIcon, UsersRoundIcon, XIcon } from "lucide-react";
import { type ReactNode, useRef, useState } from "react";
import Draggable from "react-draggable";
import { toast } from "sonner";

import {
  DoctorFormFields,
  PatientFormFields,
} from "@/components/admin-form-fields";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  api,
  type Doctor,
  type DoctorInput,
  type PatientInput,
} from "@/lib/api";

const emptyDoctor: DoctorInput = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};

const emptyPatient: PatientInput = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  condition: "",
  doctorId: "",
};

type CreateType = "doctor" | "patient" | null;

export function QuickCreate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const draggableRef = useRef<HTMLDivElement>(null);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [type, setType] = useState<CreateType>(null);
  const [doctor, setDoctor] = useState<DoctorInput>(emptyDoctor);
  const [patient, setPatient] = useState<PatientInput>(emptyPatient);
  const [patientDoctor, setPatientDoctor] = useState<Doctor>();

  const createDoctor = useMutation({
    mutationFn: () => api.createDoctor(doctor),
    onSuccess: () => {
      toast.success("Doctor created.");
      closeCreate();
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  const createPatient = useMutation({
    mutationFn: () => api.createPatient(patient.doctorId, patient),
    onSuccess: () => {
      toast.success("Patient created.");
      closeCreate();
      invalidate();
    },
    onError: (error) => toast.error(error.message),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["doctors"] });
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  function closeCreate() {
    setType(null);
    setChooserOpen(false);
    setDoctor(emptyDoctor);
    setPatient(emptyPatient);
    setPatientDoctor(undefined);
  }

  const isPending = createDoctor.isPending || createPatient.isPending;

  return (
    <>
      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick create</DialogTitle>
            <DialogDescription>
              What would you like to add to MediTrack?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 p-4"
              onClick={() => {
                setChooserOpen(false);
                setType("doctor");
              }}
            >
              <StethoscopeIcon />
              <span className="text-left">
                <span className="block font-medium">Doctor</span>
                <span className="block text-xs text-muted-foreground">
                  Add a care provider
                </span>
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto justify-start gap-3 p-4"
              onClick={() => {
                setChooserOpen(false);
                setType("patient");
              }}
            >
              <UsersRoundIcon />
              <span className="text-left">
                <span className="block font-medium">Patient</span>
                <span className="block text-xs text-muted-foreground">
                  Add a patient record
                </span>
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {type !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          aria-hidden="true"
        >
          <Draggable
            nodeRef={draggableRef}
            handle=".quick-create-handle"
            cancel="input,button,[role=listbox]"
          >
            <div
              ref={draggableRef}
              className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col gap-6 overflow-y-auto rounded-4xl bg-popover p-6 text-sm text-popover-foreground shadow-2xl ring-1 ring-foreground/5"
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-create-title"
            >
              <div className="quick-create-handle cursor-move pr-8">
                <h2
                  id="quick-create-title"
                  className="font-heading text-base leading-none font-medium"
                >
                  {type === "doctor" ? "Add doctor" : "Add patient"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {type === "doctor"
                    ? "Create a provider record for your care network."
                    : "Create a patient record and assign a doctor."}
                </p>
              </div>
              {type === "doctor" ? (
                <DoctorFormFields value={doctor} onChange={setDoctor} />
              ) : (
                <PatientFormFields
                  value={patient}
                  selectedDoctor={patientDoctor}
                  onChange={(value, selected) => {
                    setPatient(value);
                    setPatientDoctor(selected);
                  }}
                />
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={closeCreate}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={
                    isPending || (type === "patient" && !patient.doctorId)
                  }
                  onClick={() =>
                    type === "doctor"
                      ? createDoctor.mutate()
                      : createPatient.mutate()
                  }
                >
                  <PlusIcon data-icon="inline-start" />
                  {isPending ? "Creating..." : `Create ${type}`}
                </Button>
              </DialogFooter>
              <button
                type="button"
                className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={closeCreate}
                aria-label="Close quick create"
              >
                <XIcon />
              </button>
            </div>
          </Draggable>
        </div>
      )}
    </>
  );
}
