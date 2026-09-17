export default function PageLoader({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-spinner" aria-hidden />
      <p>{message}</p>
    </div>
  );
}
