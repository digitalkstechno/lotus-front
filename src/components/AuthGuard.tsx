"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token && pathname !== "/login") {
      router.replace("/login");
    } else if (token && pathname === "/login") {
      const userStr = localStorage.getItem("user");
      let route = "/task";
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          route = user.role?.toLowerCase() === "admin" ? "/staff" : "/task";
        } catch {}
      }
      router.replace(route);
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (isChecking) {
    return null; // prevents rendering protected content before token is checked
  }

  return <>{children}</>;
}
