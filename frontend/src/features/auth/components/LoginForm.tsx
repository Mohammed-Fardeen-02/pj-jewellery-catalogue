"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { ApiError } from "@/lib/api/errors";
import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useAuth } from "../hooks/useAuth";
import type { AuthTokens } from "../types/auth.types";

export interface LoginFormProps {
  onSuccess?: (tokens: AuthTokens) => void;
  className?: string;
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isNavigating, setIsNavigating] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isPending = isSubmitting || isNavigating;

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const tokens = await login(data);
      setIsNavigating(true);
      toast.success("Authentication successful! Redirecting to dashboard...");
      if (onSuccess) {
        onSuccess(tokens);
      }
    } catch (err) {
      setIsNavigating(false);
      if (err instanceof ApiError) {
        setServerError(err.message);
        toast.error(err.message);
      } else {
        const msg = "Unable to reach authentication server. Ensure backend is running.";
        setServerError(msg);
        toast.error(msg);
      }
    }
  };

  return (
    <div className="relative">
      {/* Top Gold Indeterminate Loading Bar when Submitting / Navigating */}
      {isPending && (
        <div className="absolute -top-6 -left-6 -right-6 h-1 bg-[#FAF8F4] overflow-hidden rounded-t">
          <div className="h-full bg-gradient-to-r from-[#B08D57] via-[#C5A265] to-[#B08D57] w-1/2 animate-[shimmer_1.5s_infinite_linear]" />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className={className ?? "space-y-5"} noValidate>
        {serverError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold block mb-0.5">Authentication Failed</strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        <FormField
          label="Administrator Email"
          required
          error={errors.email?.message}
        >
          <div className="relative">
            <Input
              type="email"
              placeholder="admin@pjjewellery.com"
              autoComplete="email"
              disabled={isPending}
              error={!!errors.email}
              className="pl-9 h-11 text-xs"
              {...register("email")}
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716B64] pointer-events-none" />
          </div>
        </FormField>

        <FormField
          label="Vault Password"
          required
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              autoComplete="current-password"
              disabled={isPending}
              error={!!errors.password}
              className="pl-9 pr-10 h-11 text-xs"
              {...register("password")}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#716B64] pointer-events-none" />
            <button
              type="button"
              disabled={isPending}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#716B64] hover:text-[#24211E] focus:outline-none transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </FormField>

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full h-11 relative overflow-hidden transition-all duration-300"
            disabled={isPending}
            isLoading={isPending}
          >
            {isNavigating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#B08D57]" />
                Accessing Secure Vault...
              </span>
            ) : isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#B08D57]" />
                Authenticating Administrator...
              </span>
            ) : (
              "Authenticate Administrator"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
