"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ActivityIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  CircleUserRoundIcon,
  RefreshCwIcon,
  StethoscopeIcon,
  UsersRoundIcon,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dashboardQuery } from "@/lib/queries";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export default function Page() {
  const dashboard = useQuery(dashboardQuery());

  if (dashboard.isPending) {
    return (
      <main className="flex flex-col gap-6 p-6">
        <Skeleton className="h-28 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
        <Skeleton className="h-80" />
      </main>
    );
  }

  if (dashboard.isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Dashboard unavailable</AlertTitle>
          <AlertDescription>{dashboard.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const data = dashboard.data.data;
  const rankedDoctors = [...data.patientsPerDoctor]
    .sort((a, b) => b.patientCount - a.patientCount)
    .slice(0, 5);
  const registrations = data.patientsByDate ?? [];
  const averagePatients =
    data.totalDoctors > 0
      ? (data.totalPatients / data.totalDoctors).toFixed(1)
      : "0";

  return (
    <main className="flex flex-col gap-6 bg-muted/20 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">MediTrack overview</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Good morning, here&apos;s the pulse.
          </h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dashboard.refetch()}
          disabled={dashboard.isFetching}
        >
          <RefreshCwIcon
            data-icon="inline-start"
            className={dashboard.isFetching ? "animate-spin" : undefined}
          />
          {dashboard.isFetching ? "Refreshing" : "Refresh data"}
        </Button>
      </div>
      <section className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-sm md:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 flex items-center gap-2 text-sm text-primary-foreground/75">
            <ActivityIcon />
            <span>Care network pulse · live overview</span>
          </div>
          <h1 className="max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">
            A clearer view of the people you care for.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-primary-foreground/75">
            Monitor provider capacity, patient registrations, and the doctors
            carrying the most of today&apos;s care network.
          </p>
        </div>
        <div className="absolute -right-12 -bottom-28 size-72 rounded-full border-[36px] border-primary-foreground/10" />
        <div className="absolute top-8 right-10 hidden size-24 rounded-full border border-primary-foreground/15 md:block" />
        <div className="absolute right-10 bottom-8 hidden items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs md:flex">
          <span className="size-2 rounded-full bg-chart-2" />
          Data synced
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <StethoscopeIcon />
              Total doctors
            </CardDescription>
            <CardTitle className="text-4xl tracking-tight">
              {data.totalDoctors}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">Care team</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Providers currently registered in MediTrack.
            </p>
          </CardContent>
        </Card>
        <Card className="border-chart-2/25 bg-chart-2/5">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <UsersRoundIcon />
              Total patients
            </CardDescription>
            <CardTitle className="text-4xl tracking-tight">
              {data.totalPatients}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">Active records</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Patients currently assigned across the care network.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border bg-background">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <ActivityIcon />
              Panel balance
            </CardDescription>
            <CardTitle className="text-4xl tracking-tight">
              {averagePatients}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">Per doctor</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Average patients assigned to each provider.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patients per doctor</CardTitle>
            <CardDescription>
              Where the current patient load sits across the team.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {data.patientsPerDoctor.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.patientsPerDoctor}
                  margin={{ left: -12, right: 12, bottom: 8 }}
                >
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="doctorName"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value: string) => value.replace("Dr. ", "")}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "var(--muted)" }} />
                  <Bar
                    dataKey="patientCount"
                    name="Patients"
                    fill="var(--chart-1)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No doctor assignment data yet.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Patient registrations</CardTitle>
            <CardDescription>
              New patient records over the available reporting period.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {registrations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={registrations}
                  margin={{ left: -12, right: 12, bottom: 8 }}
                >
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="_id"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={formatDate}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    labelFormatter={(value) => formatDate(String(value))}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New patients"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    dot={{ r: 3, fill: "var(--chart-2)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <CalendarDaysIcon />
                <p>Date-based registration data will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="border-b bg-muted/20">
          <div>
            <CardTitle>Top assigned doctors</CardTitle>
            <CardDescription>
              The five providers with the largest active patient panels.
            </CardDescription>
          </div>
          <CardAction>
            <Link
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              href="/admin/doctors"
            >
              View all
              <ChevronRightIcon />
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent className="p-0">
          {rankedDoctors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 pl-6">Rank</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Patient panel</TableHead>
                  <TableHead className="pr-6 text-right">
                    Share of network
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedDoctors.map((doctor, index) => (
                  <TableRow key={doctor.doctorId}>
                    <TableCell className="pl-6">
                      <Badge variant={index === 0 ? "default" : "outline"}>
                        {String(index + 1).padStart(2, "0")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <CircleUserRoundIcon />
                        </div>
                        <div>
                          <p className="font-medium">{doctor.doctorName}</p>
                          <p className="text-xs text-muted-foreground">
                            Care provider
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {doctor.patientCount}
                        </span>
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{
                              width: `${Math.min(
                                100,
                                (doctor.patientCount /
                                  Math.max(
                                    1,
                                    rankedDoctors[0]?.patientCount ?? 1,
                                  )) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right text-muted-foreground">
                      {data.totalPatients > 0
                        ? `${Math.round(
                            (doctor.patientCount / data.totalPatients) * 100,
                          )}%`
                        : "0%"}
                      <ArrowUpRightIcon className="ml-1 inline-block" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <UsersRoundIcon />
              No assigned doctors to show yet.
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
