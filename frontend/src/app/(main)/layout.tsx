import { Navbar } from '@/components/layouts/Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Global Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
