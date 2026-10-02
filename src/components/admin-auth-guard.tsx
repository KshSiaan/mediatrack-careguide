"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "@/lib/auth-client";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session.isPending && !session.data) router.replace("/auth/signin");
  }, [router, session.data, session.isPending]);

  if (session.isPending || !session.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }
  return children;
}
