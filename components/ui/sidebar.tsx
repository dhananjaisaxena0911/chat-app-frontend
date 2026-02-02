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
  const { open, setOpen, animate: sidebarAnimated } = useSidebar();
  
  return (
    <React.Fragment>
      <motion.div
        className={cn(
          "h-full hidden md:flex md:flex-col",
          "bg-sidebar/95",
          "backdrop-blur-xl border-r border-sidebar-border",
          "shadow-xl",
          "relative overflow-hidden",
          className
        )}
        animate={{
          width: sidebarAnimated ? (open ? 280 : 80) : 280,
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.34, 1.56, 0.64, 1]
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-sidebar-primary/5 via-transparent to-sidebar-primary/5 pointer-events-none" />
        
        {/* Content container */}
        <div className="relative flex flex-col h-full py-6 gap-2">
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
      {/* Mobile Header */}
      <div
        className={cn(
          "h-16 px-5 flex flex-row md:hidden items-center justify-between",
          "bg-sidebar/95",
          "backdrop-blur-xl border-b border-sidebar-border",
          "sticky top-0 z-40",
          "shadow-sm",
          className
        )}
        {...props}
      >
        <motion.button
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 transition-all duration-200 shadow-sm"
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <IconMenu2 className="h-5 w-5 text-sidebar-accent-foreground" />
        </motion.button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <React.Fragment>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 md:hidden"
              onClick={() => setOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 35,
                mass: 0.8
              }}
              className={cn(
                "fixed h-full top-0 left-0 z-50",
                "w-[320px] max-w-[85vw]",
                "bg-sidebar/95",
                "backdrop-blur-xl",
                "border-r border-sidebar-border",
                "shadow-2xl",
                "md:hidden flex flex-col",
                "overflow-hidden"
              )}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-sidebar-primary/5 via-transparent to-sidebar-primary/5 pointer-events-none" />
              
              {/* Close button */}
              <motion.button
                className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-sidebar-accent hover:bg-sidebar-accent/80 transition-all duration-200 shadow-sm flex items-center justify-center z-10"
                onClick={() => setOpen(false)}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.1 }}
              >
                <IconX className="h-5 w-5 text-sidebar-accent-foreground" />
              </motion.button>
              
              {/* Content */}
              <div className="relative flex-1 overflow-y-auto py-6 px-4">
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
  const { open, animate: sidebarAnimated } = useSidebar();

  return (
    <motion.div 
      className={cn("relative w-full px-3", className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Active indicator */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full bg-sidebar-primary shadow-lg shadow-sidebar-primary/50"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      <a
        href={link.href}
        className={cn(
          "relative flex items-center gap-3 px-4 py-3.5 rounded-xl group",
          "text-sidebar-foreground",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "transition-all duration-300 ease-out",
          "active:scale-[0.98]",
          isActive && [
            "bg-sidebar-accent text-sidebar-accent-foreground",
            "shadow-sm"
          ],
          !open && "justify-center"
        )}
      >
        {/* Icon container */}
        <motion.div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center",
            "bg-sidebar-accent/50",
            "transition-all duration-300",
            "group-hover:bg-sidebar-accent",
            isActive && [
              "bg-sidebar-primary text-sidebar-primary-foreground",
              "shadow-lg shadow-sidebar-primary/30"
            ]
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className={cn(
            "text-sidebar-foreground",
            isActive && "text-sidebar-primary-foreground"
          )}>
            {link.icon}
          </span>
        </motion.div>

        {/* Label */}
        <AnimatePresence mode="wait">
          {(!sidebarAnimated || open) && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "text-[15px] font-medium",
                "hidden md:inline-block flex-1 min-w-0 truncate"
              )}
            >
              {link.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Active indicator dot */}
        <AnimatePresence>
          {isActive && open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="ml-auto hidden md:flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-sidebar-primary shadow-lg shadow-sidebar-primary/50 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </a>
    </motion.div>
  );
};

// Divider
export const SidebarDivider = ({ className }: { className?: string }) => (
  <div className={cn("px-3 my-4", className)}>
    <div
      className={cn(
        "h-px w-full",
        "bg-sidebar-border"
      )}
    />
  </div>
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
}) => {
  const { open } = useSidebar();
  
  return (
    <div className={cn("flex flex-col gap-1 mb-2", className)}>
      {title && (
        <AnimatePresence>
          {open && (
            <motion.h3
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "px-6 py-2 mb-1 text-[11px] font-bold uppercase tracking-widest",
                "text-muted-foreground",
                "hidden md:block"
              )}
            >
              {title}
            </motion.h3>
          )}
        </AnimatePresence>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

// Footer
export const SidebarFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "mt-auto px-3 pt-4 border-t border-sidebar-border",
      className
    )}
  >
    {children}
  </div>
);

// User avatar
export const SidebarUser = ({
  name,
  avatar,
  online = false,
  subtitle,
}: {
  name: string;
  avatar?: string;
  online?: boolean;
  subtitle?: string;
}) => {
  const { open } = useSidebar();

  return (
    <motion.div
      className={cn(
        "flex items-center gap-3 px-3 py-3 mx-3 rounded-xl",
        "hover:bg-sidebar-accent",
        "cursor-pointer transition-all duration-300",
        "group relative overflow-hidden"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Hover effect */}
      <div className="absolute inset-0 bg-sidebar-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            "w-11 h-11 rounded-xl relative overflow-hidden",
            "bg-sidebar-primary",
            "flex items-center justify-center text-sidebar-primary-foreground font-bold text-lg",
            "shadow-md",
            "ring-2 ring-sidebar-border"
          )}
        >
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        {online && (
          <motion.span 
            className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-chart-2 border-2 border-sidebar shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <span className="absolute inset-0 rounded-full bg-chart-2 animate-ping opacity-75" />
          </motion.span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-w-0 hidden md:block"
          >
            <p className="text-[15px] font-semibold text-sidebar-foreground truncate">
              {name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {subtitle || "View profile"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden md:block"
        >
          <svg
            className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
};