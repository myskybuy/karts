import Link from "next/link";
import { formatInr, Product, productDiscount, StarRating } from "./ProductCard";
import ProductImage from "./ProductImage";

export default function RankingColumn({
  title,
  icon,
  href,
  products,
}: {
  title: string;
  icon: string;
  href: string;
  products: Product[];
}) {
  return (
    <section className="fk-rank-col">
      <div className="fk-rank-head">
        <h2>
          <span className="fk-rank-icon" aria-hidden>
            {icon}
          </span>
          {title}
        </h2>
        <Link href={href} className="fk-link-more">
          View All ›
        </Link>
      </div>
      <div className="fk-rank-list">
        {products.length ? (
          products.map((p) => {
            const discount = productDiscount(p);
            return (
              <Link key={p.id} href={`/product/${p.id}`} className="fk-rank-row">
                <div className="fk-rank-thumb">
                  <ProductImage src={p.image} alt="" />
                </div>
                <div className="fk-rank-info">
                  <h3>{p.name}</h3>
                  <StarRating />
                  <div className="price-row">
                    <span className="price-now">₹{formatInr(p.salePrice)}</span>
                    {discount > 0 ? (
                      <>
                        <span className="price-old">₹{formatInr(p.price)}</span>
                        <span className="price-discount">{discount}% Off</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="fk-empty">No products yet.</p>
        )}
      </div>
    </section>
  );
}
