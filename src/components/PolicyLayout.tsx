import Link from "next/link";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { COMPANY, PolicyContent } from "@/lib/policies";

export default function PolicyLayout({ policy }: { policy: PolicyContent }) {
  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <section className="section policy-page">
        <div className="container policy-container">
          <p className="about-eyebrow teal">Support</p>
          <h1 className="policy-title">{policy.title}</h1>
          <p className="policy-meta">
            {COMPANY.name} · Last updated August 2026
          </p>
          <p className="policy-intro">{policy.intro}</p>
          {policy.sections.map((s) => (
            <div key={s.heading} className="policy-block">
              <h2>{s.heading}</h2>
              <p>{s.body}</p>
              {s.bullets?.length ? (
                <ul className="policy-list">
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          <div className="policy-footer-box">
            <p>
              Questions about this policy?{" "}
              <Link href="/contact">Contact us</Link> or email{" "}
              <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> · {COMPANY.phone}
            </p>
            <p className="policy-address">{COMPANY.address}</p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </StoreShell>
  );
}
