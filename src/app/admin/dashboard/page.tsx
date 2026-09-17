"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SiteLogo from "@/components/SiteLogo";

type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  salePrice: number;
  image: string;
  stock: number;
  description: string;
};

type Category = { id: number; name: string; image: string };
type Coupon = { id: number; code: string; type: string; value: number; minOrder: number; active: boolean; expiry: string | null };
type Order = { id: number; customerName: string; email: string; address: string; phone: string; total: number; couponCode?: string; discount?: number; status: string };
type User = { id: number; name: string; email: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [productModal, setProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Partial<Product> & { id?: number }>({});

  const [categoryModal, setCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Partial<Category> & { id?: number }>({});

  const [couponModal, setCouponModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Partial<Coupon> & { id?: number; active?: boolean }>({ active: true, type: "percent" });

  const [banner, setBanner] = useState({ active: false, title: "", subtitle: "", image: "", buttonText: "Shop Now", buttonLink: "/shop" });

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => {
        if (!d.isAdmin) router.replace("/admin");
      });
    loadProducts();
  }, [router]);

  async function loadProducts() {
    setProducts(await fetch("/api/products").then((r) => r.json()));
  }
  async function loadCategories() {
    setCategories(await fetch("/api/categories").then((r) => r.json()));
  }
  async function loadCoupons() {
    setCoupons(await fetch("/api/admin/coupons").then((r) => r.json()));
  }
  async function loadOrders() {
    setOrders(await fetch("/api/admin/orders").then((r) => r.json()));
  }
  async function loadUsers() {
    setUsers(await fetch("/api/admin/users").then((r) => r.json()));
  }
  async function loadBanner() {
    setBanner(await fetch("/api/banner").then((r) => r.json()));
  }

  function switchTab(next: string) {
    setTab(next);
    if (next === "categories") loadCategories();
    if (next === "coupons") loadCoupons();
    if (next === "orders") loadOrders();
    if (next === "customers") loadUsers();
    if (next === "banner") loadBanner();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  }

  async function saveProduct() {
    const url = editProduct.id ? `/api/admin/products/${editProduct.id}` : "/api/admin/products";
    const method = editProduct.id ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editProduct) });
    setProductModal(false);
    loadProducts();
  }

  async function deleteProduct(id: number) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    loadProducts();
  }

  async function saveCategory() {
    const url = editCategory.id ? `/api/admin/categories/${editCategory.id}` : "/api/admin/categories";
    const method = editCategory.id ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editCategory) });
    setCategoryModal(false);
    loadCategories();
  }

  async function deleteCategory(id: number) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    loadCategories();
  }

  async function saveCoupon() {
    const url = editCoupon.id ? `/api/admin/coupons/${editCoupon.id}` : "/api/admin/coupons";
    const method = editCoupon.id ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editCoupon) });
    setCouponModal(false);
    loadCoupons();
  }

  async function deleteCoupon(id: number) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    loadCoupons();
  }

  async function saveBanner() {
    await fetch("/api/admin/banner", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner),
    });
    alert("Banner saved!");
  }

  async function updateOrderStatus(id: number, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  return (
    <>
      <link rel="stylesheet" href="/css/admin.css" />
      <div className="admin-shell">
        <div className="sidebar">
          <div className="brand">
            <SiteLogo />
          </div>
          {["products", "categories", "coupons", "banner", "orders", "customers"].map((t) => (
            <a key={t} className={`nav-link ${tab === t ? "active" : ""}`} onClick={() => switchTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </a>
          ))}
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>

        <div className="main-panel">
          {tab === "products" && (
            <div>
              <div className="top-actions">
                <h1>Products</h1>
                <button className="btn btn-primary" onClick={() => { setEditProduct({}); setProductModal(true); loadCategories(); }}>
                  + Add product
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td><img src={p.image} alt="" /></td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>₹{p.salePrice}</td>
                      <td className={p.stock < 10 ? "stock-low" : ""}>{p.stock}</td>
                      <td>
                        <button className="action-btn" onClick={() => { setEditProduct(p); setProductModal(true); loadCategories(); }}>Edit</button>
                        <button className="action-btn danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "categories" && (
            <div>
              <div className="top-actions">
                <h1>Categories</h1>
                <button className="btn btn-primary" onClick={() => { setEditCategory({}); setCategoryModal(true); }}>+ Add category</button>
              </div>
              <table>
                <thead><tr><th>Image</th><th>Name</th><th>Products linked</th><th>Actions</th></tr></thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td><img src={c.image} alt="" /></td>
                      <td>{c.name}</td>
                      <td>{products.filter((p) => p.category === c.name).length}</td>
                      <td>
                        <button className="action-btn" onClick={() => { setEditCategory(c); setCategoryModal(true); }}>Edit</button>
                        <button className="action-btn danger" onClick={() => deleteCategory(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "coupons" && (
            <div>
              <div className="top-actions">
                <h1>Coupons</h1>
                <button className="btn btn-primary" onClick={() => { setEditCoupon({ active: true, type: "percent" }); setCouponModal(true); }}>+ Add coupon</button>
              </div>
              <table>
                <thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.type === "percent" ? `${c.value}% off` : `₹${c.value} off`}</td>
                      <td>₹{c.minOrder || 0}</td>
                      <td>{c.expiry || "No expiry"}</td>
                      <td>{c.active ? "Active" : "Inactive"}</td>
                      <td>
                        <button className="action-btn" onClick={() => { setEditCoupon(c); setCouponModal(true); }}>Edit</button>
                        <button className="action-btn danger" onClick={() => deleteCoupon(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "banner" && (
            <div>
              <div className="top-actions"><h1>Festive Popup Banner</h1></div>
              <div style={{ maxWidth: 460 }}>
                <label><input type="checkbox" checked={banner.active} onChange={(e) => setBanner({ ...banner, active: e.target.checked })} /> Banner active</label>
                <div className="form-row"><label>Title</label><input value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} /></div>
                <div className="form-row"><label>Subtitle</label><input value={banner.subtitle} onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })} /></div>
                <div className="form-row"><label>Image URL</label><input value={banner.image} onChange={(e) => setBanner({ ...banner, image: e.target.value })} /></div>
                <div className="form-row"><label>Button text</label><input value={banner.buttonText} onChange={(e) => setBanner({ ...banner, buttonText: e.target.value })} /></div>
                <div className="form-row"><label>Button link</label><input value={banner.buttonLink} onChange={(e) => setBanner({ ...banner, buttonLink: e.target.value })} /></div>
                <button className="btn btn-primary" onClick={saveBanner}>Save banner</button>
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div>
              <div className="top-actions"><h1>Orders</h1></div>
              <table>
                <thead><tr><th>#</th><th>Customer</th><th>Phone</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.customerName}<br /><span style={{ color: "var(--a-muted)", fontSize: 12 }}>{o.email}</span></td>
                      <td>{o.phone}</td>
                      <td>₹{o.total}</td>
                      <td>{o.status}</td>
                      <td>
                        <select defaultValue={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>Shipped</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "customers" && (
            <div>
              <div className="top-actions"><h1>Registered Customers</h1></div>
              <table>
                <thead><tr><th>#</th><th>Name</th><th>Email</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}><td>#{u.id}</td><td>{u.name}</td><td>{u.email}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {productModal && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <h2>{editProduct.id ? "Edit product" : "Add product"}</h2>
            {["name", "brand", "image", "image2", "image3", "sizeOptions", "description"].map((field) => (
              <div className="form-row" key={field}>
                <label>{field === "sizeOptions" ? "Size options (comma separated, e.g. S,M,L,XL)" : field}</label>
                <input value={(editProduct as Record<string, string>)[field] || ""} onChange={(e) => setEditProduct({ ...editProduct, [field]: e.target.value })} />
              </div>
            ))}
            <div className="form-row">
              <label>Category</label>
              <select value={editProduct.category || ""} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-row"><label>Original price</label><input type="number" value={editProduct.price || ""} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} /></div>
            <div className="form-row"><label>Sale price</label><input type="number" value={editProduct.salePrice || ""} onChange={(e) => setEditProduct({ ...editProduct, salePrice: Number(e.target.value) })} /></div>
            <div className="form-row"><label>Stock</label><input type="number" value={editProduct.stock || ""} onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })} /></div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={saveProduct}>Save</button>
              <button className="btn btn-outline" onClick={() => setProductModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {categoryModal && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <h2>{editCategory.id ? "Edit category" : "Add category"}</h2>
            <div className="form-row"><label>Name</label><input value={editCategory.name || ""} onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })} /></div>
            <div className="form-row"><label>Image URL</label><input value={editCategory.image || ""} onChange={(e) => setEditCategory({ ...editCategory, image: e.target.value })} /></div>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={saveCategory}>Save</button>
              <button className="btn btn-outline" onClick={() => setCategoryModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {couponModal && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <h2>{editCoupon.id ? "Edit coupon" : "Add coupon"}</h2>
            <div className="form-row"><label>Code</label><input value={editCoupon.code || ""} onChange={(e) => setEditCoupon({ ...editCoupon, code: e.target.value.toUpperCase() })} /></div>
            <div className="form-row"><label>Type</label><select value={editCoupon.type || "percent"} onChange={(e) => setEditCoupon({ ...editCoupon, type: e.target.value })}><option value="percent">Percent</option><option value="flat">Flat</option></select></div>
            <div className="form-row"><label>Value</label><input type="number" value={editCoupon.value || ""} onChange={(e) => setEditCoupon({ ...editCoupon, value: Number(e.target.value) })} /></div>
            <div className="form-row"><label>Min order</label><input type="number" value={editCoupon.minOrder || ""} onChange={(e) => setEditCoupon({ ...editCoupon, minOrder: Number(e.target.value) })} /></div>
            <div className="form-row"><label>Expiry</label><input type="date" value={editCoupon.expiry || ""} onChange={(e) => setEditCoupon({ ...editCoupon, expiry: e.target.value })} /></div>
            <label><input type="checkbox" checked={editCoupon.active !== false} onChange={(e) => setEditCoupon({ ...editCoupon, active: e.target.checked })} /> Active</label>
            <div className="form-actions">
              <button className="btn btn-primary" onClick={saveCoupon}>Save</button>
              <button className="btn btn-outline" onClick={() => setCouponModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
