import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-white border border-[#E8E1D8] flex items-center justify-center mb-6 shadow-xs">
        <Sparkles className="w-8 h-8 text-[#B08D57]" />
      </div>
      <h1 className="font-serif text-5xl sm:text-6xl text-[#24211E] tracking-tight mb-2">
        404
      </h1>
      <h2 className="font-serif text-2xl text-[#24211E] mb-3">
        Piece Not Found
      </h2>
      <p className="text-xs text-[#716B64] max-w-md mx-auto mb-8 font-sans leading-relaxed">
        The requested jewellery piece or collection page does not exist in the Atelier PJ Catalogue or has been archived.
      </p>
      <Link href="/">
        <Button size="md">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Storefront
        </Button>
      </Link>
    </div>
  );
}
