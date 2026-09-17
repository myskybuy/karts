export default function StoreShell({
  children,
  topBar,
}: {
  children: React.ReactNode;
  topBar?: React.ReactNode;
}) {
  return (
    <div className="store-shell">
      {topBar}
      <main className="store-main">{children}</main>
    </div>
  );
}
