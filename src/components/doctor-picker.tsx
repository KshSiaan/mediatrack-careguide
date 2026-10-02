"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Doctor } from "@/lib/api";
import { doctorsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

type DoctorPickerProps = {
  value: string;
  onChange: (value: string, doctor?: Doctor) => void;
  selectedDoctor?: Doctor;
  includeAll?: boolean;
  placeholder?: string;
  allLabel?: string;
  className?: string;
};

export function DoctorPicker({
  value,
  onChange,
  selectedDoctor,
  includeAll = false,
  placeholder = "Choose a doctor",
  allLabel = "All doctors",
  className,
}: DoctorPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  const params = new URLSearchParams({
    page: "1",
    limit: "20",
  });
  if (debouncedSearch) params.set("search", debouncedSearch);

  const doctors = useQuery(doctorsQuery(params, open));
  const selectedFromResults = doctors.data?.data.find(
    (doctor) => doctor._id === value,
  );
  const selected = selectedFromResults ?? selectedDoctor;
  const label = value === "all" ? allLabel : (selected?.name ?? placeholder);

  function selectDoctor(nextValue: string, doctor?: Doctor) {
    onChange(nextValue, doctor);
    setOpen(false);
    setSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-expanded={open}
          aria-haspopup="listbox"
          className={cn("w-full justify-between", className)}
        >
          <span
            className={cn(
              !selected && value !== "all" && "text-muted-foreground",
            )}
          >
            {label}
          </span>
          <ChevronsUpDownIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-2"
      >
        <PopoverHeader className="px-2 py-1">
          <PopoverTitle>
            {includeAll ? "Filter doctors" : "Assign a doctor"}
          </PopoverTitle>
          <PopoverDescription>
            Search by doctor name, specialty, or hospital.
          </PopoverDescription>
        </PopoverHeader>
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Start typing to search..."
            className="pl-9"
            autoFocus
          />
        </div>
        <div
          className="flex max-h-60 flex-col gap-1 overflow-y-auto"
          role="listbox"
        >
          {includeAll && (
            <Button
              type="button"
              variant="ghost"
              className="justify-between"
              onClick={() => selectDoctor("all")}
              role="option"
              aria-selected={value === "all"}
            >
              {allLabel}
              {value === "all" && <CheckIcon />}
            </Button>
          )}
          {doctors.isPending ? (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2Icon className="animate-spin" />
              Searching doctors...
            </div>
          ) : doctors.isError ? (
            <p className="p-3 text-sm text-destructive">
              Could not load doctors. Try again.
            </p>
          ) : doctors.data.data.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">
              No doctors match “{debouncedSearch}”.
            </p>
          ) : (
            doctors.data.data.map((doctor) => (
              <Button
                key={doctor._id}
                type="button"
                variant="ghost"
                className="h-auto justify-between px-3 py-2 text-left"
                onClick={() => selectDoctor(doctor._id, doctor)}
                role="option"
                aria-selected={value === doctor._id}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {doctor.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {doctor.specialization} · {doctor.hospital}
                  </span>
                </span>
                {value === doctor._id && <CheckIcon />}
              </Button>
            ))
          )}
        </div>
        {doctors.data && doctors.data.pagination.total > 20 && (
          <p className="px-2 text-xs text-muted-foreground">
            Showing the first 20 matches. Refine your search for more precise
            results.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}
