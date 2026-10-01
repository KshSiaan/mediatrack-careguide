import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Left Panel */}
      <div className="relative hidden flex-1 overflow-hidden lg:block">
        {/* Back Button */}
        <div className="absolute left-6 top-6 z-10">
          <Button
            type="button"
            size="icon"
            className="rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Link>
          </Button>
        </div>

        <div className="absolute inset-0">
          <Image
            height={1080}
            width={1920}
            src="/auth.jpg"
            alt="Brand Asset"
            priority
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {children}
    </div>
  );
}
