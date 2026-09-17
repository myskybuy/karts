"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AuthPanel from "@/components/AuthPanel";
import PageLoader from "@/components/PageLoader";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";

export default function AccountPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  // Already signed in? Send them straight to their profile.
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) router.replace("/profile");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [router]);

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      {checking ? (
        <PageLoader message="Loading…" />
      ) : (
      <div className="account-page">
          <div className="auth-card">
            <AuthPanel
              title="Welcome to Karts"
              message="Log in or create an account to track orders and check out faster."
              onSuccess={() => {
                window.location.href = "/profile";
              }}
            />
          </div>
      </div>
      )}
      <SiteFooter />
    </StoreShell>
  );
}
