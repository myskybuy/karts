"use client";

import { FormEvent, useState } from "react";

export type AuthUser = { id: number; name: string; email: string; phone?: string };

type AuthPanelProps = {
  title?: string;
  message?: string;
  onSuccess: (user: AuthUser) => void;
};

/**
 * Shared login / signup / OTP flow. Rendered on its own by the /account page and
 * wrapped in an overlay by <AuthModal>. Keeping the logic in one place means the
 * page and the modal can never drift apart again.
 */
export default function AuthPanel({
  title = "Login required",
  message = "Please log in or create an account to continue.",
  onSuccess,
}: AuthPanelProps) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [otpPending, setOtpPending] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");

  function switchTab(next: "login" | "signup") {
    setTab(next);
    setError("");
    setInfo("");
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.otpRequired) {
        setOtpEmail(data.email || loginEmail);
        setOtpValue("");
        setOtpPending(true);
        setInfo(`We've sent a 6-digit OTP to ${data.email || loginEmail}.`);
      } else if (data.success && data.user) {
        onSuccess(data.user);
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) onSuccess(data.user);
      else setError(data.error || "Sign up failed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp: otpValue }),
      });
      const data = await res.json();
      if (data.success && data.user) onSuccess(data.user);
      else setError(data.error || "OTP verification failed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError("");
    setInfo("");
    setResending(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (data.success) setInfo(`A new OTP has been sent to ${otpEmail}.`);
      else setError(data.error || "Could not resend OTP");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  }

  function backToLogin() {
    setOtpPending(false);
    setOtpValue("");
    setError("");
    setInfo("");
  }

  if (otpPending) {
    return (
      <div className="auth-panel">
        <h2>Verify your email</h2>
        <p className="auth-panel-msg">Enter the 6-digit OTP sent to {otpEmail} to finish logging in.</p>
        <form onSubmit={handleVerifyOtp}>
          <div className="form-group">
            <label>OTP</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="otp-input"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              required
            />
          </div>
          <button
            className="btn btn-accent"
            style={{ width: "100%" }}
            type="submit"
            disabled={loading || otpValue.length !== 6}
          >
            {loading ? "Verifying…" : "Verify & Login"}
          </button>
        </form>
        <div className="auth-panel-otp-actions">
          <button type="button" className="auth-panel-link" onClick={handleResendOtp} disabled={resending}>
            {resending ? "Resending…" : "Resend OTP"}
          </button>
          <button type="button" className="auth-panel-link" onClick={backToLogin} disabled={loading}>
            Back to login
          </button>
        </div>
        {info ? <p className="auth-panel-info">{info}</p> : null}
        {error ? <p className="auth-panel-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <h2>{title}</h2>
      <p className="auth-panel-msg">{message}</p>
      <div className="account-tabs">
        <button type="button" className={tab === "login" ? "active" : ""} onClick={() => switchTab("login")}>
          Log in
        </button>
        <button type="button" className={tab === "signup" ? "active" : ""} onClick={() => switchTab("signup")}>
          Sign up
        </button>
      </div>

      {tab === "login" ? (
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading}>
            {loading ? "Please wait…" : "Log in"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full name</label>
            <input
              type="text"
              autoComplete="name"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              autoComplete="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading}>
            {loading ? "Please wait…" : "Create account"}
          </button>
        </form>
      )}

      {info ? <p className="auth-panel-info">{info}</p> : null}
      {error ? <p className="auth-panel-error">{error}</p> : null}
    </div>
  );
}
