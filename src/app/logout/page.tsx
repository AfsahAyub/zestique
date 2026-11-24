
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
        });
      } finally {
        router.replace("/login");
        router.refresh();
      }
    }

    logout();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#123d32] text-white">
      <p className="text-lg">Logging out...</p>
    </main>
  );
}
