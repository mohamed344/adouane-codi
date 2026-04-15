import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { SkipToContent } from "@/components/skip-to-content";

/**
 * (app) — protected app shell.
 * Each page renders its own <PageShell> for max-width control.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(var(--background))]">
      <SkipToContent />
      <AppHeader />
      {children}
      <Footer />
    </div>
  );
}
