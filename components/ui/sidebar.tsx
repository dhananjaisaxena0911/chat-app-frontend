
"use client";
import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}): React.ReactNode => {
  return (
    <React.Fragment key="sidebar-body">
      <DesktopSidebar className={className} {...props}>
        {children}
      </DesktopSidebar>
      <MobileSidebar className={className} {...props}>
        {children}
      </MobileSidebar>
    </React.Fragment>
  ) as React.ReactNode;
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}): React.ReactElement => {
  // Rename animate to avoid conflict with motion.div's animate prop
  const { open, setOpen, animate: sidebarAnimated } = useSidebar();
  return (
    <React.Fragment>
      <motion.div
        className={cn(
          "h-full hidden md:flex md:flex-col",
          "bg-white/80 dark:bg-neutral-900/80",
          "backdrop-blur-xl border-r border-neutral-200/50 dark:border-neutral-700/50",
          "shadow-xl shadow-black/5 dark:shadow-black/20",
          className
        )}
        animate={{
          width: sidebarAnimated ? (open ? 300 : 72) : 300,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        <div className="flex flex-col h-full px-1 py-4 overflow-hidden">
          {children}
        </div>
      </motion.div>
    </React.Fragment>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}): React.ReactElement => {
  const { open, setOpen } = useSidebar();

  return (
    <React.Fragment>
      <div
        className={cn(
          "h-14 px-4 py-3 flex flex-row md:hidden items-center justify-between",
          "bg-white/80 dark:bg-neutral-900/80",
          "backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-700/50",
          "sticky top-0 z-40",
          className
        )}
        {...props}
      >
        <button
          className="flex items-center justify-center p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          onClick={() => setOpen(!open)}
        >
          <IconMenu2 className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <React.Fragment>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className={cn(
                "fixed h-full top-0 left-0 z-50",
                "w-80 max-w-[85vw]",
                "bg-white/95 dark:bg-neutral-900/95",
                "backdrop-blur-xl",
                "border-r border-neutral-200/50 dark:border-neutral-700/50",
                "shadow-2xl shadow-black/20",
                "md:hidden flex flex-col"
              )}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors z-10"
                onClick={() => setOpen(false)}
              >
                <IconX className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
              </button>
              <div className="flex-1 overflow-y-auto p-4 pt-12">
                {children}
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
};

export const SidebarLink = ({
  link,
  className,
  isActive = false,
}: {
  link: Links;
  className?: string;
  isActive?: boolean;
  children?: React.ReactNode;
}) => {
  // Rename to avoid conflict with motion.div's animate prop
  const { open, animate: sidebarAnimated } = useSidebar();

  return (
    <div className={cn("relative w-full", className)}>
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}

      <a
        href={link.href}
        className={cn(
          "relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl",
          "text-neutral-700 dark:text-neutral-300",
          "hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80",
          "transition-all duration-200",
          isActive && "text-blue-600 dark:text-blue-400"
        )}
      >
        {/* Icon wrapper */}
        <motion.div
          className={cn(
            "flex-shrink-0 p-2 rounded-lg",
            "bg-neutral-100 dark:bg-neutral-800",
            "transition-colors duration-200"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="relative z-10">{link.icon}</span>
        </motion.div>

        {/* Label */}
        <AnimatePresence mode="wait">
          {(!sidebarAnimated || open) && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "whitespace-pre text-sm font-medium",
                "hidden md:inline-block"
              )}
            >
              {link.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Active badge */}
        {isActive && (
          <motion.span
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-auto hidden md:inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          >
            New
          </motion.span>
        )}
      </a>
    </div>
  );
};

// Divider component
export const SidebarDivider = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "my-3 mx-2 h-px",
      "bg-gradient-to-r from-transparent via-neutral-200 to-transparent",
      "dark:via-neutral-700",
      className
    )}
  />
);

// Section header
export const SidebarSection = ({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1", className)}>
    {title && (
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          "px-4 py-2 text-xs font-semibold uppercase tracking-wider",
          "text-neutral-500 dark:text-neutral-400",
          "hidden md:block"
        )}
      >
        {title}
      </motion.h3>
    )}
    {children}
  </div>
);

// Footer section
export const SidebarFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "mt-auto pt-4 border-t border-neutral-200/50 dark:border-neutral-700/50",
      className
    )}
  >
    {children}
  </div>
);

// User avatar component
export const SidebarUser = ({
  name,
  avatar,
  online = false,
}: {
  name: string;
  avatar?: string;
  online?: boolean;
}) => {
  const { open } = useSidebar();

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "cursor-pointer transition-colors duration-200"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            "h-10 w-10 rounded-full",
            "bg-gradient-to-br from-blue-500 to-purple-600",
            "flex items-center justify-center text-white font-semibold"
          )}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            name.charAt(0).toUpperCase()
          )}
        </div>
        {online && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-neutral-900" />
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 min-w-0"
          >
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              View profile
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

