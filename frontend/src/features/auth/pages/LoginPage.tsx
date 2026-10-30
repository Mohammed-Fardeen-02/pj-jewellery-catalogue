"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Shield } from "lucide-react";

import { LoginForm } from "../components/LoginForm";

export function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Home Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#716B64] hover:text-[#24211E] mb-6 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Storefront
          </Link>

          <div className="w-12 h-12 bg-[#24211E] rounded-full mx-auto flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-[#B08D57]" />
          </div>

          <h2 className="font-serif text-3xl font-medium tracking-tight text-[#24211E]">
            Atelier Administration
          </h2>
          <p className="mt-1 text-xs text-[#716B64] uppercase tracking-wider font-sans">
            PJ Jewellery Private Management Portal
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E8E1D8] shadow-xs">
          <LoginForm onSuccess={() => router.push("/admin")} />

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-[#F0EAE2] text-[11px] text-[#716B64] space-y-1.5">
            <div className="flex items-start gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#B08D57] shrink-0 mt-0.5" />
              <span>
                Protected under Argon2 cryptographic verification. Accounts can only be provisioned via explicit server CLI seed commands.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
