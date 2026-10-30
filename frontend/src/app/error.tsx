"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log unexpected client error
    console.error("Storefront Client Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-[#FAF8F4] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mb-6 text-rose-600">
        <AlertCircle className="w-7 h-7 stroke-[1.5]" />
      </div>
      <h2 className="font-serif text-3xl text-[#24211E] mb-2">
        An Unexpected Error Occurred
      </h2>
      <p className="text-xs text-[#716B64] max-w-md mx-auto mb-8 font-sans leading-relaxed">
        We encountered an issue rendering this jewellery view. Our studio team has been notified.
      </p>
      <div className="flex items-center gap-4">
        <Button variant="primary" size="md" onClick={() => reset()}>
          Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" size="md">
            Return to Storefront
          </Button>
        </Link>
      </div>
    </div>
  );
}
