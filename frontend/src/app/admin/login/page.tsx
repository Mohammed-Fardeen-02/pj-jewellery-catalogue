import type { Metadata } from "next";
import { LoginPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Authenticate to access the PJ Fine Jewellery Atelier management portal.",
};

export default function AdminLoginRoute() {
  return <LoginPage />;
}
