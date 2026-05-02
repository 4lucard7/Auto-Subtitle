import { Link, useLocation } from "wouter";
import {
  Upload,
  FileVideo,
  Download,
  Settings,
  LogOut,
  Activity,
  LayoutDashboard,
} from "lucide-react";

export function AppLayout({
  children,
  breadcrumb,
}: {
  children: React.ReactNode;
  breadcrumb?: string;
}) {
  const [location] = useLocation();

  const jobIdMatch = location.match(/\/jobs\/([^/]+)/);
  const currentJobId = jobIdMatch ? jobIdMatch[1] : null;

  const isUploadActive = location === "/upload";
  const isEditorActive = !!(currentJobId && !location.includes("/export"));
  const isExportActive = !!(currentJobId && location.includes("/export"));
  const isDashboardActive = location === "/history";

  const editorHref = currentJobId ? `/jobs/${currentJobId}` : "/upload";
  const exportHref = currentJobId ? `/jobs/${currentJobId}/export` : "/upload";

  return (
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-44 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">AutoSub</span>
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 px-3 py-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">
            Menu
          </p>
          <nav className="space-y-0.5">
            <SidebarItem
              href="/history"
              icon={LayoutDashboard}
              label="Dashboard"
              active={isDashboardActive}
            />
            <SidebarItem
              href={editorHref}
              icon={FileVideo}
              label="Editor"
              active={isEditorActive}
            />
            <SidebarItem
              href="/upload"
              icon={Upload}
              label="New Upload"
              active={isUploadActive}
            />
            <SidebarItem
              href={exportHref}
              icon={Download}
              label="Export"
              active={isExportActive}
            />
          </nav>
        </div>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-gray-200 space-y-0.5">
          <SidebarItem href="#" icon={Settings} label="Settings" active={false} />
          <SidebarItem
            href="/upload"
            icon={LogOut}
            label="New Project"
            active={false}
            danger
          />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">
              AutoSub
            </Link>
            {breadcrumb && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium truncate max-w-xs">
                  {breadcrumb}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/upload"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              New Project
            </Link>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 px-6 py-3 flex items-center justify-between text-xs text-gray-400 bg-white">
          <span>© 2024 AutoSub AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-gray-600 cursor-pointer">Privacy</span>
            <span className="hover:text-gray-600 cursor-pointer">Terms</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Status: Operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SidebarItem({
  href,
  icon: Icon,
  label,
  active,
  danger,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-2 py-2 rounded-md text-sm transition-colors ${
        active
          ? "bg-gray-100 text-gray-900 font-medium"
          : danger
          ? "text-red-500 hover:bg-red-50"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
      }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
