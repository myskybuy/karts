"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";
import ProductImage from "@/components/ProductImage";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { MAX_CART_QTY, useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import WishButton from "@/components/WishButton";
import PageLoader from "@/components/PageLoader";
import { getPdpCopy } from "@/lib/product-copy";
import { getSizeChart, rowMatchesOption } from "@/lib/size-charts";

type AccordionId = "details" | "specs" | "sizechart" | "delivery" | "care";

export default function ProductPage() {
  const params = useParams();
  const { addToCart, isInCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState("");
  const [related, setRelated] = useState<Product[]>([]);
  const [openAcc, setOpenAcc] = useState<AccordionId>("details");
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setRelated([]);
    setQty(1);
    setOpenAcc("details");
    setShowChart(false);
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((p: Product) => {
        if (!p?.id) return;
        setProduct(p);
        setActiveImg(0);
        const sizes = (p.sizeOptions || "").split(",").map((s) => s.trim()).filter(Boolean);
        setSize(sizes[0] || "");
        fetch(`/api/products?category=${encodeURIComponent(p.category)}&exclude=${p.id}&limit=8`)
          .then((r) => r.json())
          .then((list: Product[]) => setRelated(Array.isArray(list) ? list : []))
          .catch(() => setRelated([]));
      });
  }, [params.id]);

  useEffect(() => {
    if (feedback !== "added") return;
    const t = setTimeout(() => setFeedback("idle"), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

  if (!product) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <PageLoader message="Loading product…" />
        <SiteFooter />
      </StoreShell>
    );
  }

  const discount = product.price > 0 ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const inCart = isInCart(product.id);
  const wished = isInWishlist(product.id);
  const btnLabel = feedback === "added" ? "Added to cart" : inCart ? "Add more" : "Add to cart";
  const gallery = [product.image, product.image2, product.image3].filter(Boolean) as string[];
  const sizes = (product.sizeOptions || "").split(",").map((s) => s.trim()).filter(Boolean);
  const maxQty = Math.min(MAX_CART_QTY, product.stock > 0 ? product.stock : MAX_CART_QTY);
  const inCartQty = cart.find((i) => i.id === product.id)?.qty || 0;
  const copy = getPdpCopy(product);
  const specRows = [...copy.specs, { label: "Max quantity", value: `${maxQty} per item` }];
  const sizeChart = getSizeChart(product);

  function toggleAcc(id: AccordionId) {
    setOpenAcc((cur) => (cur === id ? cur : id));
  }

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="pdp-shell">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            {" / "}
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link>
            {" / "}
            {product.name}
          </div>
        </div>

        <div className="product-page">
          <div className={`pdp-gallery ${gallery.length > 1 ? "" : "solo"}`}>
            {gallery.length > 1 ? (
              <div className="gallery-thumbs">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={i === activeImg ? "active" : ""}
                    onClick={() => setActiveImg(i)}
                  >
                    <ProductImage src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="gallery-main">
              {discount > 0 ? <span className="badge-sale">{discount}% OFF</span> : null}
              <WishButton product={{ id: product.id, name: product.name, image: product.image, salePrice: product.salePrice }} />
              <ProductImage src={gallery[activeImg] || product.image} alt={product.name} />
            </div>
          </div>

          <div className="product-info">
            {product.brand ? <p className="pdp-brand">{product.brand}</p> : null}
            <span className="pshape">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="price-row">
              <span className="price-now">₹{product.salePrice.toLocaleString("en-IN")}</span>
              {product.price > product.salePrice ? (
                <span className="price-old">₹{product.price.toLocaleString("en-IN")}</span>
              ) : null}
              {discount > 0 ? <span className="price-discount">{discount}% off</span> : null}
            </div>
            <div className="pdp-chips">
              <span>Cash on Delivery</span>
              <span>7-day returns</span>
              <span>Max {maxQty} per order</span>
            </div>

            {sizes.length || sizeChart ? (
              <div className="size-row">
                <div className="size-row-head">
                  {sizes.length ? <label>Size</label> : null}
                  {sizeChart ? (
                    <button
                      type="button"
                      className="size-chart-link"
                      onClick={() => setShowChart((v) => !v)}
                    >
                      Size chart
                    </button>
                  ) : null}
                </div>
                {sizes.length ? (
                  <div className="size-options">
                    {sizes.map((s) => (
                      <button key={s} type="button" className={s === size ? "active" : ""} onClick={() => setSize(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                ) : null}
                {showChart && sizeChart ? (
                  <div className="pdp-size-inline">
                    <p className="pdp-size-title">{sizeChart.title}</p>
                    <div className="pdp-size-chart-wrap">
                      <table className="pdp-size-chart">
                        <thead>
                          <tr>
                            {sizeChart.headers.map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sizeChart.rows.map((row) => (
                            <tr
                              key={row.size}
                              className={rowMatchesOption(row, product.sizeOptions || "") ? "is-listed" : ""}
                            >
                              <td>{row.size}</td>
                              {row.cols.map((c, i) => (
                                <td key={i}>{c}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="pdp-size-note">{sizeChart.measure}</p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="qty-row">
              <label>Quantity</label>
              <div className="pdp-qty">
                <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((n) => Math.max(1, n - 1))}>
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={qty >= maxQty}
                  onClick={() => setQty((n) => Math.min(maxQty, n + 1))}
                >
                  +
                </button>
              </div>
              <small className="pdp-qty-hint">
                {inCartQty ? `${inCartQty} already in cart · ` : null}
                Up to {maxQty} pieces
              </small>
            </div>

            <div className="pdp-actions">
              <button
                className={`btn btn-accent ${feedback === "added" ? "added" : ""}`}
                type="button"
                onClick={() => {
                  addToCart(
                    { id: product.id, name: product.name, image: product.image, salePrice: product.salePrice },
                    qty
                  );
                  setFeedback("added");
                }}
              >
                {btnLabel}
              </button>
              <Link href="/cart" className="btn btn-outline">
                Go to cart
              </Link>
              <button
                type="button"
                className={`btn btn-outline wish-pdp-btn ${wished ? "active" : ""}`}
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    name: product.name,
                    image: product.image,
                    salePrice: product.salePrice,
                  })
                }
              >
                {wished ? "In wishlist" : "Add to wishlist"}
              </button>
            </div>

            <div className="pdp-trust">
              <span>Fast delivery</span>
              <span>Safe payment</span>
              <span>7-day exchange</span>
              <span>Authentic listing</span>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="pdp-acc">
            <div className={`pdp-acc-item ${openAcc === "details" ? "open" : ""}`}>
              <button type="button" onClick={() => toggleAcc("details")}>
                Product details
              </button>
              {openAcc === "details" ? (
                <div className="pdp-acc-body">
                  <p className="product-desc">{product.description}</p>
                  <h3>Highlights</h3>
                  <ul>
                    {copy.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className={`pdp-acc-item ${openAcc === "specs" ? "open" : ""}`}>
              <button type="button" onClick={() => toggleAcc("specs")}>
                Specifications
              </button>
              {openAcc === "specs" ? (
                <div className="pdp-acc-body">
                  <dl className="pdp-specs">
                    {specRows.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>
            {sizeChart ? (
              <div className={`pdp-acc-item ${openAcc === "sizechart" ? "open" : ""}`}>
                <button type="button" onClick={() => toggleAcc("sizechart")}>
                  Size chart
                </button>
                {openAcc === "sizechart" ? (
                  <div className="pdp-acc-body">
                    <p className="pdp-size-title">{sizeChart.title}</p>
                    <div className="pdp-size-chart-wrap">
                      <table className="pdp-size-chart">
                        <thead>
                          <tr>
                            {sizeChart.headers.map((h) => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sizeChart.rows.map((row) => (
                            <tr
                              key={row.size}
                              className={rowMatchesOption(row, product.sizeOptions || "") ? "is-listed" : ""}
                            >
                              <td>{row.size}</td>
                              {row.cols.map((c, i) => (
                                <td key={i}>{c}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="pdp-size-note">{sizeChart.measure}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
            <div className={`pdp-acc-item ${openAcc === "delivery" ? "open" : ""}`}>
              <button type="button" onClick={() => toggleAcc("delivery")}>
                Delivery &amp; returns
              </button>
              {openAcc === "delivery" ? (
                <div className="pdp-acc-body">
                  <ul>
                    {copy.delivery.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                    <li>
                      Need help? See our <Link href="/return-policy">Return Policy</Link> and{" "}
                      <Link href="/shipping-delivery-policy">Shipping Policy</Link>.
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>
            <div className={`pdp-acc-item ${openAcc === "care" ? "open" : ""}`}>
              <button type="button" onClick={() => toggleAcc("care")}>
                Care
              </button>
              {openAcc === "care" ? (
                <div className="pdp-acc-body">
                  <p>{copy.care}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {related.length ? (
        <section className="pdp-related">
          <div className="container">
            <div className="pdp-related-head">
              <h2>Related products</h2>
              <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="fk-link-more">
                View all →
              </Link>
            </div>
            <ProductCarousel products={related} />
          </div>
        </section>
      ) : null}
      <SiteFooter />
    </StoreShell>
  );
}
