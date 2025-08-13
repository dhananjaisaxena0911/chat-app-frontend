"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (!pathname) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const isAuthPage = pathname.startsWith("/auth") || pathname.startsWith("/login");

    console.log("ProtectedRoute useEffect - pathname:", pathname);
    console.log("ProtectedRoute useEffect - isAuthPage:", isAuthPage);
    console.log("ProtectedRoute useEffect - token:", token);

    if (!token && !isAuthPage) {
      console.log("No token and not on auth page, redirecting to /auth");
      router.replace("/auth");
    } else if (token && isAuthPage) {
      console.log("Token present and on auth page, redirecting to /");
      router.replace("/");
    } else {
      setIsAuthChecked(true);
    }
  }, [pathname, router]);

  if (!isAuthChecked) {
    return null; // You could show a <LoadingSpinner /> here
  }

  return <>{children}</>;
}
