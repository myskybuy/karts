const PLACEHOLDER = "/images/product-placeholder.svg";

export default function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      className={className}
      src={src || PLACEHOLDER}
      alt={alt}
      onError={(e) => {
        const el = e.currentTarget;
        if (el.dataset.fallback === "1") return;
        el.dataset.fallback = "1";
        el.src = PLACEHOLDER;
      }}
    />
  );
}
