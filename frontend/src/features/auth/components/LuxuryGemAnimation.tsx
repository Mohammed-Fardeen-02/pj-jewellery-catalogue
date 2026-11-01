"use client";

import * as React from "react";
import { ShieldCheck, Sparkles, KeyRound, Gem } from "lucide-react";

export function LuxuryGemAnimation() {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-8 lg:p-14 overflow-hidden select-none bg-gradient-to-br from-[#121110] via-[#1A1816] to-[#24211E] text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#B08D57]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[240px] h-[240px] bg-[#C5A265]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Decorative background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#B08D57 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Header: Brand Identity */}
      <div className="relative z-10 space-y-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#B08D57]/30 bg-[#B08D57]/10 text-[#C5A265] text-[11px] tracking-widest uppercase font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#B08D57] animate-pulse" />
          <span>Haute Joaillerie Atelier</span>
        </div>
        <h1 className="font-serif text-3xl lg:text-4xl font-light tracking-wide text-[#FAF8F4]">
          PJ Atelier Privé
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#B08D57]/80 font-sans">
          Curated Fine Jewellery &amp; High Vault Registry
        </p>
      </div>

      {/* Center: Animated Luxury Gemstone & Concentric Orbitals */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Outer orbital ring */}
          <div className="absolute inset-0 rounded-full border border-[#B08D57]/20 border-dashed animate-[spin_40s_linear_infinite]" />

          {/* Middle counter-rotating orbital ring */}
          <div className="absolute inset-4 rounded-full border border-[#C5A265]/30 animate-[spin_28s_linear_infinite_reverse]" />

          {/* Inner pulsing ring */}
          <div className="absolute inset-10 rounded-full border border-[#B08D57]/40 animate-pulse" />

          {/* Floating stardust sparkles */}
          <div className="absolute -top-2 left-1/3 text-[#B08D57] animate-bounce duration-1000">
            ✦
          </div>
          <div className="absolute top-1/2 -right-3 text-[#C5A265] animate-pulse">
            ✧
          </div>
          <div className="absolute bottom-4 left-6 text-[#B08D57]/70 animate-bounce duration-700">
            ✦
          </div>
          <div className="absolute top-8 right-8 text-[#C5A265]/80 text-xs animate-ping">
            ✦
          </div>

          {/* Faceted Gem Core Container */}
          <div className="relative z-10 w-28 h-28 rounded-2xl bg-gradient-to-br from-[#24211E] to-[#121110] border border-[#B08D57]/60 shadow-[0_0_50px_rgba(176,141,87,0.25)] flex items-center justify-center group">
            {/* SVG Brilliant Cut Gem Geometry */}
            <svg
              viewBox="0 0 100 100"
              className="w-16 h-16 text-[#C5A265] drop-shadow-[0_0_12px_rgba(176,141,87,0.6)] transition-transform duration-700 group-hover:scale-105"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              {/* Crown table facet */}
              <polygon
                points="30,22 70,22 88,46 50,88 12,46"
                stroke="#C5A265"
                strokeWidth="2"
                fill="url(#goldGradient)"
                fillOpacity="0.15"
              />
              <line x1="30" y1="22" x2="12" y2="46" stroke="#B08D57" strokeWidth="1.5" />
              <line x1="70" y1="22" x2="88" y2="46" stroke="#B08D57" strokeWidth="1.5" />
              <line x1="12" y1="46" x2="88" y2="46" stroke="#E8D5B5" strokeWidth="1.5" />
              <line x1="30" y1="22" x2="40" y2="46" stroke="#B08D57" strokeWidth="1.5" />
              <line x1="70" y1="22" x2="60" y2="46" stroke="#B08D57" strokeWidth="1.5" />
              <line x1="40" y1="46" x2="50" y2="88" stroke="#E8D5B5" strokeWidth="2" />
              <line x1="60" y1="46" x2="50" y2="88" stroke="#E8D5B5" strokeWidth="2" />
              <line x1="12" y1="46" x2="50" y2="88" stroke="#B08D57" strokeWidth="1.5" />
              <line x1="88" y1="46" x2="50" y2="88" stroke="#B08D57" strokeWidth="1.5" />

              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="100" y2="100">
                  <stop offset="0%" stopColor="#C5A265" />
                  <stop offset="50%" stopColor="#FAF8F4" />
                  <stop offset="100%" stopColor="#987642" />
                </linearGradient>
              </defs>
            </svg>

            {/* Glowing inner jewel shimmer */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-[#B08D57]/10 to-transparent animate-pulse" />
          </div>
        </div>

        {/* Caption below gem */}
        <div className="text-center mt-6 space-y-1">
          <p className="font-serif text-lg tracking-wide text-[#FAF8F4] italic">
            &ldquo;Perfection in Every Facet&rdquo;
          </p>
          <p className="text-[11px] text-[#A69E92] font-mono uppercase tracking-widest">
            Cryptographic Vault Governance &bull; Single-Brand Authority
          </p>
        </div>
      </div>

      {/* Bottom Footer: Security & Trust Pillars */}
      <div className="relative z-10 pt-6 border-t border-[#B08D57]/20 grid grid-cols-3 gap-3 text-center">
        <div className="flex flex-col items-center gap-1.5 p-2 rounded bg-white/[0.03] border border-white/[0.05]">
          <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#E8D5B5]">
            Argon2id
          </span>
          <span className="text-[9px] text-[#8C8479]">Vault Encryption</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 p-2 rounded bg-white/[0.03] border border-white/[0.05]">
          <Gem className="w-4 h-4 text-[#B08D57]" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#E8D5B5]">
            100% Provenance
          </span>
          <span className="text-[9px] text-[#8C8479]">Certified Inventory</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 p-2 rounded bg-white/[0.03] border border-white/[0.05]">
          <KeyRound className="w-4 h-4 text-[#B08D57]" />
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#E8D5B5]">
            RBAC Guard
          </span>
          <span className="text-[9px] text-[#8C8479]">Strict Isolation</span>
        </div>
      </div>
    </div>
  );
}

