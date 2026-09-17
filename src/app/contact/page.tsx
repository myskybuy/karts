"use client";

import { FormEvent, useState } from "react";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { COMPANY } from "@/lib/policies";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Karts contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${COMPANY.email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <section className="section contact-page">
        <div className="container contact-layout">
          <div className="contact-info">
            <div className="eyebrow">Support</div>
            <h2>Contact us</h2>
            <p>Orders, returns, or product questions — we&apos;re here to help.</p>
            <div className="contact-card">
              <strong>{COMPANY.name}</strong>
              <p>{COMPANY.address}</p>
              <p>
                <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>
              </p>
              <p>
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </p>
            </div>
          </div>
          <div className="contact-form-wrap">
            <h3>Send a message</h3>
            {sent ? (
              <p className="contact-success">Your email app should open — send the message to complete contact.</p>
            ) : (
              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label>Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required placeholder="How can we help?" />
                </div>
                <button type="submit" className="btn btn-accent">
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </StoreShell>
  );
}
