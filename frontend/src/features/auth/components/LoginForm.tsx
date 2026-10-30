"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
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

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const tokens = await login(data);
      toast.success("Authentication successful! Redirecting to dashboard...");
      if (onSuccess) {
        onSuccess(tokens);
      }
    } catch (err) {
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
    <form onSubmit={handleSubmit(onSubmit)} className={className ?? "space-y-5"} noValidate>
      {serverError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {serverError}
        </div>
      )}

      <FormField
        label="Administrator Email"
        required
        error={errors.email?.message}
      >
        <Input
          type="email"
          placeholder="admin@pjjewellery.com"
          autoComplete="email"
          error={!!errors.email}
          {...register("email")}
        />
      </FormField>

      <FormField
        label="Password"
        required
        error={errors.password?.message}
      >
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            autoComplete="current-password"
            error={!!errors.password}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#716B64] hover:text-[#24211E] focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </FormField>

      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          Authenticate Administrator
        </Button>
      </div>
    </form>
  );
}
