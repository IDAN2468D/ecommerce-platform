"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center text-sm text-slate-500">
        מעביר אותך לדף ההתחברות...
      </div>
    </div>
  );
}
