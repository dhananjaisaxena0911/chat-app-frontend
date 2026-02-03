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

    // Check both localStorage and cookies for the token
    const localToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    // Also check for cookie (set by /api/auth/set-cookie)
    const cookieToken = typeof window !== "undefined" 
      ? document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
      : null;
    
    const token = localToken || cookieToken;
    const isAuthPage = pathname.startsWith("/auth") || pathname.startsWith("/login");

    console.log("ProtectedRoute useEffect - pathname:", pathname);
    console.log("ProtectedRoute useEffect - isAuthPage:", isAuthPage);
    console.log("ProtectedRoute useEffect - localToken:", localToken);
    console.log("ProtectedRoute useEffect - cookieToken:", cookieToken);

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
