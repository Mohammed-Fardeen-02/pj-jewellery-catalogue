"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Shield, Sparkles } from "lucide-react";

import { LoginForm } from "../components/LoginForm";
import { LuxuryGemAnimation } from "../components/LuxuryGemAnimation";

export function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-[#FAF8F4]">
      {/* Left Column: Haute Joaillerie Luxury Theme & Dynamic Animation (Desktop/Tablet) */}
      <div className="lg:col-span-7 xl:col-span-7 hidden lg:block relative min-h-screen">
        <LuxuryGemAnimation />
      </div>

      {/* Right Column: Administrator Login Credentials Container */}
      <div className="lg:col-span-5 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen bg-[#FAF8F4] relative">
        {/* Top bar with back to storefront navigation */}
        <div className="flex items-center justify-between pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#716B64] hover:text-[#24211E] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Storefront</span>
          </Link>

          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-[#B08D57] bg-[#B08D57]/10 px-2.5 py-1 rounded-full border border-[#B08D57]/20">
            <Sparkles className="w-3 h-3" />
            Portal v2.6
          </span>
        </div>

        {/* Credentials Form Box */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="w-12 h-12 bg-[#24211E] rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#B08D57]/30">
              <Lock className="w-5 h-5 text-[#B08D57]" />
            </div>

            <h2 className="font-serif text-3xl font-medium tracking-tight text-[#24211E]">
              Atelier Administration
            </h2>
            <p className="mt-1.5 text-xs text-[#716B64] font-sans tracking-wide">
              Sign in with your authorized administrator credentials to manage jewellery collections, vault inventory, and acquisitions.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white p-7 sm:p-8 border border-[#E8E1D8] shadow-sm rounded-xs">
            <LoginForm onSuccess={() => router.push("/admin")} />

            {/* Cryptographic Protection Disclosure */}
            <div className="mt-6 pt-5 border-t border-[#F0EAE2] text-[11px] text-[#716B64] space-y-2">
              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-[#B08D57] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Protected under <strong>Argon2id</strong> cryptographic verification. Sessions are encrypted and subject to administrative role boundaries.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-6 border-t border-[#E8E1D8]/60 text-center text-[11px] text-[#9E988F] font-mono">
          &copy; {new Date().getFullYear()} PJ Jewellery Atelier Privé. All rights reserved.
        </div>
      </div>
    </div>
  );
}
