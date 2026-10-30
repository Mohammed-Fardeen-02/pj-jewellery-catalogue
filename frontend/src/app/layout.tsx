import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | PJ Jewellery",
    default: "PJ — Fine Jewellery & High Artistry Catalogue",
  },
  description:
    "Explore the exclusive catalogue of PJ Fine Jewellery. Handcrafted bespoke high jewellery, rare gemstones, and timeless luxury.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAF8F4] text-[#24211E] min-h-screen flex flex-col font-sans">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#24211E",
              border: "1px solid #E8E1D8",
              fontFamily: "var(--font-sans)",
            },
          }}
        />
      </body>
    </html>
  );
}
