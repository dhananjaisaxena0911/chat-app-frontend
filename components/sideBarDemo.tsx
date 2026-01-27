"use client";
import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next/client";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconPencil,
  IconMessage,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

// Constants for styling - DRY principle
const ICON_CLASSES = "h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200";

interface SidebarLinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarDemoProps {
  children?: React.ReactNode;
}

export function SidebarDemo({ children }: SidebarDemoProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Memoize logout handler to prevent unnecessary re-renders
  const handleLogout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("token");

    // Clear session cookie
    deleteCookie("token", { path: "/" });

    // Use Next.js router for proper navigation
    router.push("/auth");
  }, [router]);

  // Memoize links array to prevent unnecessary re-renders
  const links: SidebarLinkItem[] = useMemo(
    () => [
      {
        label: "Dashboard",
        href: "/",
        icon: <IconBrandTabler className={ICON_CLASSES} />,
      },
      {
        label: "Messages",
        href: "/messages",
        icon: <IconMessage className={ICON_CLASSES} />,
      },
      {
        label: "Profile",
        href: "/profile",
        icon: <IconUserBolt className={ICON_CLASSES} />,
      },
      {
        label: "Groups",
        href: "/group",
        icon: <IconSettings className={ICON_CLASSES} />,
      },
      {
        label: "Blog",
        href: "/blog",
        icon: <IconPencil className={ICON_CLASSES} />,
      },
    ],
    []
  );

  return (
    <div
      className={cn(
        "flex w-full min-h-screen",
        "bg-gray-100 dark:bg-neutral-900"
      )}
    >
      {/* Sidebar - Fixed position */}
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className={cn(
          "hidden md:flex flex-col transition-all duration-300 flex-shrink-0 h-screen sticky top-0",
          open ? "w-64" : "w-16"
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 h-full">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto h-full">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link) => (
                  <SidebarLink key={link.href} link={link} />
                ))}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full text-left rounded-md transition-colors"
            >
              <IconArrowLeft className="h-5 w-5 shrink-0" />
              <span className={cn(open ? "inline-block" : "hidden")}>
                Logout
              </span>
            </button>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Mobile sidebar toggle - visible on mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
        >
          <IconBrandTabler className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-neutral-800 shadow-xl"
          >
            <Sidebar open={open} setOpen={setOpen}>
              <SidebarBody className="justify-between gap-10 h-full pt-12">
                <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto h-full">
                  {open ? <Logo /> : <LogoIcon />}
                  <div className="mt-8 flex flex-col gap-2">
                    {links.map((link) => (
                      <SidebarLink key={link.href} link={link} />
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full text-left rounded-md transition-colors"
                >
                  <IconArrowLeft className="h-5 w-5 shrink-0" />
                  <span className={cn(open ? "inline-block" : "hidden")}>
                    Logout
                  </span>
                </button>
              </SidebarBody>
            </Sidebar>
          </div>
        </div>
      )}

      {/* Main content - Scrollable */}
      <main className="flex-1 p-4 min-h-screen">{children}</main>
    </div>
  );
}

// Logo components - exported for backward compatibility
export const Logo = () => (
  <a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium whitespace-pre text-black dark:text-white"
    >
      Be Social
    </motion.span>
  </a>
);

export const LogoIcon = () => (
  <a
    href="#"
    className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
  >
    <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
  </a>
);

