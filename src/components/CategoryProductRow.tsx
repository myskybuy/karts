import Link from "next/link";
import ProductCard, { Product } from "./ProductCard";

type Category = { id: number; name: string; image: string };

export default function CategoryProductRow({
  category,
  products,
}: {
  category: Category;
  products: Product[];
}) {
  const href = `/shop?category=${encodeURIComponent(category.name)}`;

  return (
    <section className="fk-cat-row">
      <Link href={href} className="fk-cat-banner">
        {category.image ? (
          <img src={category.image} alt="" />
        ) : (
          <span className="fk-cat-banner-fallback">{category.name.charAt(0)}</span>
        )}
        <strong>{category.name}</strong>
      </Link>
      <div className="fk-cat-products-wrap">
        <div className="fk-cat-products-head">
          <Link href={href} className="fk-link-more">
            View All ›
          </Link>
        </div>
        <div className="fk-cat-products">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}
