"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import Link from "next/link";
import { authClient } from "../../../lib/auth-client";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(data: FormValues) {
    setIsLoading(true);
    authClient.signIn.email(
      {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      },
      {
        onError: (error) => {
          // toast.error(
          //   error?.error?.message || "An error occurred during sign-in.",
          // );
          form.setError("password", {
            message:
              error?.error?.message || "An error occurred during sign-in.",
          });
          setIsLoading(false);
        },
        onSuccess: (session) => {
          toast.success(
            `Welcome back, ${session?.data?.user?.name || "User"}!`,
          );
          setIsLoading(false);
          window.location.href = "/admin/d";
        },
      },
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-white">
      <div className="w-full max-w-md p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          {/* <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 font-medium"
              asChild
            >
              <Link href="/auth/signup">Sign up</Link>
            </Button>
          </p> */}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            {/* Email */}
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>

                  <FieldContent>
                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Password */}
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>

                  <FieldContent>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        aria-invalid={fieldState.invalid}
                        className="pr-10"
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword((previous) => !previous)}
                        className="absolute right-1"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between">
              <Controller
                name="rememberMe"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal" className="w-fit">
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      className="border! border-primary"
                      onCheckedChange={field.onChange}
                    />

                    <FieldLabel htmlFor="rememberMe" className="font-normal">
                      Remember me
                    </FieldLabel>
                  </Field>
                )}
              />

              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-sm text-blue-600"
              >
                Forgot password?
              </Button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
