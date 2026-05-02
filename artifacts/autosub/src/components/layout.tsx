import { Link, useLocation } from "wouter";
import { Upload, History, Activity } from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck({
    query: { refetchInterval: 30000 } // check every 30s
  });

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-mono font-bold text-xl tracking-tight transition-opacity hover:opacity-80">
            <Activity className="w-5 h-5" />
            AUTOSUB<span className="text-muted-foreground">_</span>
          </Link>
          
          <nav className="flex items-center gap-1">
            <Link href="/upload" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/upload' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
              <Upload className="w-4 h-4" />
              New Job
            </Link>
            <Link href="/history" className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location === '/history' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
              <History className="w-4 h-4" />
              History
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border bg-card py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="font-mono">
            AUTOSUB v1.0.0
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-destructive'}`} />
            System Status
          </div>
        </div>
      </footer>
    </div>
  );
}
