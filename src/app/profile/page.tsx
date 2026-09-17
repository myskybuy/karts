"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import PageLoader from "@/components/PageLoader";
import { useWishlist } from "@/components/WishlistProvider";

type Tab = "info" | "addresses" | "orders" | "wishlist" | "security";
type User = { id: number; name: string; email: string; phone?: string };
type OrderItem = { id?: number; name: string; image?: string; salePrice: number; qty: number };
type Order = { id: number; total: number; status: string; createdAt: string; items: OrderItem[] };
type Address = {
  id: number;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const emptyAddress = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

const TABS: { id: Tab; label: string }[] = [
  { id: "info", label: "Profile info" },
  { id: "addresses", label: "Addresses" },
  { id: "orders", label: "Orders" },
  { id: "wishlist", label: "Wishlist" },
  { id: "security", label: "Security" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("info");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [form, setForm] = useState(emptyAddress);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.user) {
          router.replace("/account");
          return;
        }
        setUser(d.user);
        setName(d.user.name || "");
        setPhone(d.user.phone || "");
        const [orderRes, addrRes] = await Promise.all([fetch("/api/account/orders"), fetch("/api/account/addresses")]);
        const orderData = await orderRes.json().catch(() => []);
        const addrData = await addrRes.json().catch(() => []);
        setOrders(Array.isArray(orderData) ? orderData : []);
        setAddresses(Array.isArray(addrData) ? addrData : []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/account");
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not save profile");
      return;
    }
    setUser(data.user);
    toast.success("Profile updated");
  }

  function openCancelModal(order: Order) {
    setCancelTarget(order);
  }

  function closeCancelModal() {
    if (cancelling) return;
    setCancelTarget(null);
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    const res = await fetch(`/api/account/orders/${cancelTarget.id}`, { method: "PATCH" });
    const data = await res.json().catch(() => ({}));
    setCancelling(false);
    if (!res.ok) {
      toast.error(data.error || "Could not cancel this order. Please try again.");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === cancelTarget.id ? { ...o, status: "Cancelled" } : o)));
    setCancelTarget(null);
    toast.success(`Order #${cancelTarget.id} cancelled`);
  }

  async function refreshAddresses() {
    const addrData = await fetch("/api/account/addresses").then((r) => r.json());
    setAddresses(Array.isArray(addrData) ? addrData : []);
  }

  function startEdit(addr?: Address) {
    if (addr) {
      setEditingId(addr.id);
      setForm({
        label: addr.label,
        fullName: addr.fullName,
        phone: addr.phone,
        line1: addr.line1,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: addr.isDefault,
      });
    } else {
      setEditingId(null);
      setForm({ ...emptyAddress, fullName: user?.name || "", phone: user?.phone || "" });
    }
    setShowAddrForm(true);
  }

  async function saveAddress(e: FormEvent) {
    e.preventDefault();
    const url = editingId ? `/api/account/addresses/${editingId}` : "/api/account/addresses";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not save address");
      return;
    }
    setShowAddrForm(false);
    setEditingId(null);
    await refreshAddresses();
    toast.success(editingId ? "Address updated" : "Address saved");
  }

  async function removeAddress(id: number) {
    const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not remove address");
      return;
    }
    await refreshAddresses();
    toast.success("Address removed");
  }

  async function makeDefault(addr: Address) {
    const res = await fetch(`/api/account/addresses/${addr.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...addr, isDefault: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Could not set default address");
      return;
    }
    await refreshAddresses();
    toast.success("Default address updated");
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not update password");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password updated");
  }

  if (loading) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <PageLoader message="Loading your account…" />
        <SiteFooter />
      </StoreShell>
    );
  }

  if (!user) return null;

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="profile-shell">
      <div className="profile-dash">
        <aside className="profile-side">
          <div className="profile-side-head">
            <div className="profile-avatar" aria-hidden>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="profile-hello">Hello,</div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-email">{user.email}</div>
            </div>
          </div>
          <nav className="profile-nav">
            {TABS.map((t) => (
              <button key={t.id} type="button" className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
          <button type="button" className="btn btn-outline profile-logout" onClick={logout}>
            Log out
          </button>
        </aside>

        <section className="profile-panel">
          {tab === "info" ? (
            <>
              <h2>Profile info</h2>
              <form className="profile-form" onSubmit={saveProfile}>
                <div className="form-row">
                  <label>Full name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input value={user.email} disabled />
                </div>
                <div className="form-row">
                  <label>Mobile number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" />
                </div>
                <button type="submit" className="btn btn-accent">
                  Save changes
                </button>
              </form>
            </>
          ) : null}

          {tab === "addresses" ? (
            <>
              <div className="profile-panel-head">
                <h2>Saved addresses</h2>
                <button type="button" className="btn btn-outline" onClick={() => startEdit()}>
                  Add address
                </button>
              </div>
              {showAddrForm ? (
                <form className="profile-form" onSubmit={saveAddress}>
                  <div className="form-row">
                    <label>Label</label>
                    <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}>
                      <option>Home</option>
                      <option>Work</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-row">
                    <label>Full name</label>
                    <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                  </div>
                  <div className="form-row">
                    <label>Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                  </div>
                  <div className="form-row">
                    <label>Address</label>
                    <textarea value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} required />
                  </div>
                  <div className="form-row-split">
                    <div className="form-row">
                      <label>City</label>
                      <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                    </div>
                    <div className="form-row">
                      <label>State</label>
                      <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                    </div>
                    <div className="form-row">
                      <label>Pincode</label>
                      <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
                    </div>
                  </div>
                  <label className="profile-check">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    />
                    Default delivery address
                  </label>
                  <div className="profile-form-actions">
                    <button type="submit" className="btn btn-accent">
                      {editingId ? "Update address" : "Save address"}
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setShowAddrForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
              {addresses.length ? (
                addresses.map((a) => (
                  <div key={a.id} className="address-card">
                    <div className="address-card-head">
                      <strong>{a.label}</strong>
                      {a.isDefault ? <span className="status-tag">Default</span> : null}
                    </div>
                    <p>
                      {a.fullName} · {a.phone}
                      <br />
                      {a.line1}, {a.city}, {a.state} - {a.pincode}
                    </p>
                    <div className="address-card-actions">
                      <button type="button" className="auth-panel-link" onClick={() => startEdit(a)}>
                        Edit
                      </button>
                      {!a.isDefault ? (
                        <button type="button" className="auth-panel-link" onClick={() => makeDefault(a)}>
                          Set default
                        </button>
                      ) : null}
                      <button type="button" className="remove-btn" onClick={() => removeAddress(a.id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : !showAddrForm ? (
                <p className="profile-empty">No addresses yet. Add one for faster checkout.</p>
              ) : null}
            </>
          ) : null}

          {tab === "orders" ? (
            <>
              <h2>My orders</h2>
              {orders.length ? (
                orders.map((o) => {
                  const items = Array.isArray(o.items) ? o.items : [];
                  return (
                    <div key={o.id} className="order-card">
                      <div className="order-head">
                        <span>Order #{o.id}</span>
                        <span className={`status-tag ${o.status}`}>{o.status}</span>
                      </div>
                      <div className="order-meta">
                        {new Date(o.createdAt).toLocaleDateString("en-IN")} · {items.length} item(s)
                      </div>
                      <div className="order-total">₹{o.total.toLocaleString("en-IN")}</div>
                      <div className="order-card-actions">
                        <button
                          type="button"
                          className="auth-panel-link"
                          onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                        >
                          {expandedOrder === o.id ? "Hide items" : "View items"}
                        </button>
                        {o.status === "Pending" || o.status === "Confirmed" ? (
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => openCancelModal(o)}
                          >
                            Cancel order
                          </button>
                        ) : null}
                      </div>
                      {expandedOrder === o.id ? (
                        <ul className="order-items">
                          {items.map((item, i) => (
                            <li key={item.id || i}>
                              {item.name} × {item.qty} — ₹{(item.salePrice * item.qty).toLocaleString("en-IN")}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <p className="profile-empty">
                  No orders yet. <Link href="/shop">Start shopping →</Link>
                </p>
              )}
            </>
          ) : null}

          {tab === "wishlist" ? (
            <>
              <div className="profile-panel-head">
                <h2>Wishlist</h2>
                <Link href="/wishlist" className="fk-link-more">
                  Open wishlist →
                </Link>
              </div>
              {wishlist.length ? (
                <div className="profile-wish-grid">
                  {wishlist.slice(0, 8).map((item) => (
                    <div key={item.id} className="profile-wish-card">
                      <Link href={`/product/${item.id}`}>
                        <img src={item.image} alt="" />
                        <strong>{item.name}</strong>
                      </Link>
                      <span>₹{item.salePrice.toLocaleString("en-IN")}</span>
                      <button type="button" className="remove-btn" onClick={() => removeFromWishlist(item.id)}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="profile-empty">
                  Your wishlist is empty. <Link href="/shop">Browse products →</Link>
                </p>
              )}
            </>
          ) : null}

          {tab === "security" ? (
            <>
              <h2>Security</h2>
              <form className="profile-form" onSubmit={changePassword}>
                <div className="form-row">
                  <label>Current password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="form-row">
                  <label>New password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
                </div>
                <button type="submit" className="btn btn-accent">
                  Update password
                </button>
              </form>
            </>
          ) : null}
        </section>
      </div>
      </div>
      <SiteFooter />
      {cancelTarget ? (
        <div
          className="auth-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
          onClick={closeCancelModal}
        >
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="auth-modal-close" onClick={closeCancelModal} aria-label="Close" disabled={cancelling}>
              ×
            </button>
            <p className="confirm-modal-kicker">Order #{cancelTarget.id}</p>
            <h2 id="cancel-order-title">Cancel this order?</h2>
            <p className="confirm-modal-copy">
              This order has not been dispatched yet. If you cancel, it cannot be restored. You can place a new order anytime.
            </p>
            <p className="confirm-modal-meta">
              {Array.isArray(cancelTarget.items) ? cancelTarget.items.length : 0} item(s) · ₹
              {cancelTarget.total.toLocaleString("en-IN")}
            </p>
            <div className="confirm-modal-actions">
              <button type="button" className="btn btn-outline" onClick={closeCancelModal} disabled={cancelling}>
                Keep order
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmCancel} disabled={cancelling}>
                {cancelling ? "Cancelling…" : "Yes, cancel order"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </StoreShell>
  );
}
