"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SidebarDemo } from "./sideBarDemo";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth") || pathname?.startsWith("/login");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex" }}>
      <SidebarDemo />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
