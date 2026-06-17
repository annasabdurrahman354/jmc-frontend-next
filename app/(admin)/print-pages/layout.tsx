// Print pages don't need the admin sidebar/header layout.
// This layout overrides the (admin) layout for print routes.
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="print-layout">
      {children}
    </div>
  );
}
