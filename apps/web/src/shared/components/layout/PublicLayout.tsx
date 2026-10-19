import React from "react";
import { Outlet } from "react-router-dom";
import { LandingNavbar } from "../../../features/landing/components/LandingNavbar";
import { Footer } from "../../../features/landing/components/Footer";

export function PublicLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-700">
      <LandingNavbar />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}
