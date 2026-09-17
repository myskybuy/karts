"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Banner = {
  active: boolean;
  title: string;
  subtitle: string;
  image: string;
  buttonText: string;
  buttonLink: string;
};

export default function FestivePopup() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/banner")
      .then((r) => r.json())
      .then((b: Banner) => {
        if (!b.active) return;
        const dismissedOn = localStorage.getItem("dharmakart_popup_dismissed");
        const today = new Date().toDateString();
        if (dismissedOn === today) return;
        setBanner(b);
        setOpen(true);
      });
  }, []);

  if (!open || !banner) return null;

  return (
    <div
      style={{
        display: "flex",
        position: "fixed",
        inset: 0,
        background: "rgba(20,24,26,0.55)",
        zIndex: 100,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          maxWidth: 400,
          width: "90%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <button
          onClick={() => {
            setOpen(false);
            localStorage.setItem("dharmakart_popup_dismissed", new Date().toDateString());
          }}
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            background: "rgba(0,0,0,0.4)",
            color: "#fff",
            border: "none",
            width: 28,
            height: 28,
            borderRadius: "50%",
            fontSize: 16,
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          ×
        </button>
        <img src={banner.image} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
        <div style={{ padding: 20, textAlign: "center" }}>
          <h3 style={{ margin: "0 0 6px", textTransform: "none", fontFamily: "Inter,sans-serif", fontWeight: 800 }}>
            {banner.title}
          </h3>
          <p style={{ color: "var(--color-muted)", fontSize: 14, margin: "0 0 16px" }}>{banner.subtitle}</p>
          <Link href={banner.buttonLink.replace("/shop.html", "/shop")} className="btn btn-accent">
            {banner.buttonText}
          </Link>
        </div>
      </div>
    </div>
  );
}
