"use client";

import { XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type DateRangeFilterProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
};

export function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
}: DateRangeFilterProps) {
  const hasInvalidRange = Boolean(from && to && from > to);

  return (
    <FieldGroup className="w-max shrink-0 gap-2">
      <div className="flex w-max flex-nowrap items-center gap-2">
        <Field className="w-36 shrink-0 gap-1.5">
          <FieldLabel htmlFor="date-filter-from" className="text-xs">
            From date
          </FieldLabel>
          <Input
            id="date-filter-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => onFromChange(event.target.value)}
            aria-invalid={hasInvalidRange}
          />
        </Field>

        <Field className="w-36 shrink-0 gap-1.5">
          <FieldLabel htmlFor="date-filter-to" className="text-xs">
            To date
          </FieldLabel>
          <Input
            id="date-filter-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => onToChange(event.target.value)}
            aria-invalid={hasInvalidRange}
          />
        </Field>

        {(from || to) && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            aria-label="Clear date range"
          >
            <XIcon />
          </Button>
        )}
      </div>

      {hasInvalidRange && (
        <p className="text-xs text-destructive" role="alert">
          The start date must be before the end date.
        </p>
      )}
    </FieldGroup>
  );
}
