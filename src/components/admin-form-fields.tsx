"use client";

import { DoctorPicker } from "@/components/doctor-picker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Doctor, DoctorInput, PatientInput } from "@/lib/api";

const doctorFields = [
  "name",
  "specialization",
  "hospital",
  "phone",
  "email",
] as const;

const patientFields = [
  "name",
  "email",
  "phone",
  "dateOfBirth",
  "condition",
] as const;

function labelFor(field: string) {
  return field === "dateOfBirth"
    ? "Date of birth"
    : field[0].toUpperCase() + field.slice(1);
}

export function DoctorFormFields({
  value,
  onChange,
}: {
  value: DoctorInput;
  onChange: (value: DoctorInput) => void;
}) {
  return (
    <FieldGroup>
      {doctorFields.map((field) => (
        <Field key={field}>
          <FieldLabel htmlFor={`doctor-${field}`}>{labelFor(field)}</FieldLabel>
          <Input
            id={`doctor-${field}`}
            type={field === "email" ? "email" : "text"}
            value={value[field]}
            onChange={(event) =>
              onChange({ ...value, [field]: event.target.value })
            }
          />
        </Field>
      ))}
    </FieldGroup>
  );
}

export function PatientFormFields({
  value,
  selectedDoctor,
  onChange,
}: {
  value: PatientInput;
  selectedDoctor?: Doctor;
  onChange: (value: PatientInput, doctor?: Doctor) => void;
}) {
  return (
    <FieldGroup>
      {patientFields.map((field) => (
        <Field key={field}>
          <FieldLabel htmlFor={`patient-${field}`}>
            {labelFor(field)}
          </FieldLabel>
          <Input
            id={`patient-${field}`}
            type={
              field === "email"
                ? "email"
                : field === "dateOfBirth"
                  ? "date"
                  : "text"
            }
            value={value[field]}
            onChange={(event) =>
              onChange(
                { ...value, [field]: event.target.value },
                selectedDoctor,
              )
            }
          />
        </Field>
      ))}
      <Field>
        <FieldLabel htmlFor="patient-doctor">Assigned doctor</FieldLabel>
        <DoctorPicker
          value={value.doctorId}
          selectedDoctor={selectedDoctor}
          onChange={(doctorId, doctor) =>
            onChange({ ...value, doctorId }, doctor)
          }
        />
      </Field>
    </FieldGroup>
  );
}
