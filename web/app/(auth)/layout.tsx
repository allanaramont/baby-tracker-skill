export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(180deg, #0f1e3a 0%, #1b2d4f 100%)' }}
    >
      {children}
    </div>
  );
}
