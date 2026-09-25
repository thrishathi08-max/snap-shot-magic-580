import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/upload", label: "Upload Feedback" },
  { to: "/explorer", label: "Feedback Explorer" },
  { to: "/issues", label: "Issues" },
  { to: "/decisions", label: "Product Decisions" },
  { to: "/cross-domain", label: "Cross-Domain Insights" },
] as const;

function AmbientLight() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute -top-40 -left-20 size-[520px] rounded-full bg-brand/10 blur-3xl" />
      <div className="absolute top-1/3 right-0 size-[420px] rounded-full bg-brand/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 size-[380px] rounded-full bg-card/40 blur-3xl" />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-glass backdrop-blur-xl md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="grid size-8 place-items-center rounded-lg bg-ink font-display font-semibold text-primary-foreground">
          I
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold">InsightFlow</p>
          <p className="label-mono mt-0.5">Feedback OS</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-0.5 px-3 text-sm">
        <p className="label-mono px-2 pt-2 pb-1.5">Workspace</p>
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-ink/5 data-[status=active]:bg-brand/10 data-[status=active]:font-medium data-[status=active]:text-brand"
          >
            <span className="size-1.5 rounded-full bg-faint/50 group-data-[status=active]:bg-brand" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="glass-inset m-3 p-3">
        <p className="label-mono">Pipeline</p>
        <p className="mt-1 font-display text-sm font-semibold">1,284 signals</p>
        <p className="text-xs text-muted-foreground">processed today</p>
      </div>
    </aside>
  );
}

function TopBar({ breadcrumb }: { breadcrumb: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-glass backdrop-blur-xl">
      <div className="flex items-center gap-4 px-5 py-3">
        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <span className="font-medium text-ink">Analytics</span>
          <span className="text-faint">/</span>
          <span>{breadcrumb}</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <svg
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3-3" />
            </svg>
            <input
              type="text"
              placeholder="Search issues, feedback, decisions…"
              className="w-40 rounded-lg border border-border bg-glass-strong py-2 pr-3 pl-9 text-sm placeholder:text-faint focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none sm:w-72"
            />
          </div>
          <button
            type="button"
            aria-label="Notifications"
            className="grid size-9 place-items-center rounded-lg border border-border bg-glass-strong text-muted-foreground transition-colors hover:bg-card"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          <div className="flex items-center gap-2.5 rounded-lg border border-border bg-glass-strong py-1 pr-3 pl-1">
            <div className="grid size-7 place-items-center rounded-md bg-brand/15 font-display text-xs font-semibold text-brand">
              AR
            </div>
            <span className="hidden text-sm font-medium sm:block">
              Ava Reyes
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  breadcrumb,
  children,
}: {
  breadcrumb: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink antialiased">
      <AmbientLight />
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar breadcrumb={breadcrumb} />
          <main className="flex-1 px-5 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
