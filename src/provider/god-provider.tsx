"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { Suspense } from "react";
import { ApiError } from "@/lib/api";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: { retry: 0 },
    },
  });
}

export default function GodProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const [queryClient] = React.useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense>{children}</Suspense>
      {isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
