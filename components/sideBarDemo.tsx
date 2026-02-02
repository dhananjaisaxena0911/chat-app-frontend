"use client";
import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next/client";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import {
  IconLayoutDashboard,
  IconMessageCircle,
  IconUser,
  IconLogout,
  IconHome,
  IconUsers,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

// Constants for styling - DRY principle
const ICON_CLASSES = "h-5 w-5 shrink-0";

interface SidebarLinkItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarDemoProps {
  children?: React.ReactNode;
}

// Mobile-friendly sidebar link that always shows text
function MobileSidebarLink({ link }: { link: SidebarLinkItem }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    router.push(link.href);
    setIsActive(true);
  };

  return (
    <div className={cn("relative w-full", isActive && "bg-gray-50 dark:bg-neutral-800 rounded-lg")}>
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="mobileActiveIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-600 shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <button
        onClick={handleClick}
        className={cn(
          "relative z-10 flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left",
          "text-gray-600 dark:text-gray-300",
          "hover:bg-gray-100 dark:hover:bg-neutral-800",
          "hover:text-gray-900 dark:hover:text-white",
          "transition-all duration-200 ease-out"
        )}
      >
        {/* Icon wrapper */}
        <motion.div
          className={cn(
            "flex-shrink-0 p-2.5 rounded-lg",
            "bg-gray-100 dark:bg-neutral-800",
            "transition-all duration-200"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10 block">{link.icon}</span>
        </motion.div>

        {/* Label - Always visible on mobile */}
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="whitespace-pre text-sm font-semibold tracking-wide text-gray-900 dark:text-white"
        >
          {link.label}
        </motion.span>

        {/* Active badge */}
        {isActive && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
          >
            New
          </motion.span>
        )}
      </button>
    </div>
  );
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
        label: "Home",
        href: "/",
        icon: <IconHome className={ICON_CLASSES} />,
      },
      {
        label: "Find Friends",
        href: "/FindFriends",
        icon: <IconUsers className={ICON_CLASSES} />,
      },
      {
        label: "Messages",
        href: "/messages",
        icon: <IconMessageCircle className={ICON_CLASSES} />,
      },
      {
        label: "Profile",
        href: "/profile",
        icon: <IconUser className={ICON_CLASSES} />,
      },
    ],
    []
  );

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar - Fixed position */}
      <div
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="hidden md:block flex-shrink-0 h-full"
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-0 h-full">
            {/* Navigation Links */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <nav className="flex flex-col gap-1 px-2">
                  {links.map((link) => (
                    <SidebarLink key={link.href} link={link} />
                  ))}
                </nav>
              </div>
              
              {/* Logout Button */}
              <div className="px-2 pb-4 mt-2">
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-xl",
                    "text-gray-600 dark:text-gray-300",
                    "hover:bg-gray-100 dark:hover:bg-neutral-800",
                    "hover:text-gray-900 dark:hover:text-white",
                    "transition-all duration-200 ease-out",
                    !open && "justify-center px-2"
                  )}
                >
                  <motion.div
                    className={cn(
                      "flex-shrink-0 p-2.5 rounded-lg",
                      "bg-gray-100 dark:bg-neutral-800",
                      "transition-all duration-200"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconLogout className={ICON_CLASSES} />
                  </motion.div>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="whitespace-pre text-sm font-semibold tracking-wide"
                    >
                      Logout
                    </motion.span>
                  )}
                </button>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Mobile sidebar toggle - visible on mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setOpen(!open)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 transition-transform hover:scale-105 active:scale-95"
        >
          <IconLayoutDashboard className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-neutral-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar open={true} setOpen={setOpen}>
              <SidebarBody className="justify-between gap-0 h-full pt-14">
                <div className="flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    <nav className="flex flex-col gap-1 px-2">
                      {links.map((link) => (
                        <MobileSidebarLink key={link.href} link={link} />
                      ))}
                    </nav>
                  </div>
                  
                  {/* Mobile Logout Button */}
                  <div className="px-2 pb-4 mt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                    >
                      <div className="flex-shrink-0 p-2.5 rounded-lg bg-gray-100 dark:bg-neutral-800">
                        <IconLogout className="h-5 w-5 shrink-0" />
                      </div>
                      <span className="whitespace-pre text-sm font-semibold tracking-wide text-gray-900 dark:text-white">
                        Logout
                      </span>
                    </button>
                  </div>
                </div>
              </SidebarBody>
            </Sidebar>
          </motion.div>
        </div>
      )}

      {/* Main content - Full viewport */}
      <main className="flex-1 h-full overflow-auto">{children}</main>
    </div>
  );
}

