"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next/client";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar"; // Adjust this
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconPencil,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
export function SidebarDemo({ children }: { children?: React.ReactNode }) {
  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("currentUserId");
    localStorage.removeItem("token");

    deleteCookie("token", { path: "/" });

    console.log("Logged out. Redirecting to /auth");

    window.location.href = "/auth";
  };

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Profile",
      href: "/profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Groups",
      href: "/group",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Blog",
      href: "/blog",
      icon: (
        <IconPencil className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);

  return (
    <div
      className={cn(
        "mx-auto flex w-full  flex-1 min-h-screen flex-col overflow-visible rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "h-screen"
      )}
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`transition-all duration-300 ${open ? "w-64" : "w-16"}`}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 ">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
            <div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 w-full text-left"
              >
                <IconArrowLeft className="h-5 w-5 shrink-0" />
                Logout
              </button>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

export const Logo = () => {
  return (
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
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};
