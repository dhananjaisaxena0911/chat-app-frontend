"use client";

import { useState } from "react";
import { Sidebar, SidebarBody } from "../components/ui/sidebar";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={open} setOpen={setOpen} animate={false}>
        <SidebarBody className="flex flex-col" />
      </Sidebar>
      <main className="flex-1">{children}</main>
    </div>
  );
}
