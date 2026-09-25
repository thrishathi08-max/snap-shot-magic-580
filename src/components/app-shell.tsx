import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, Check, ChevronDown, Menu, Search, UserRound, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { searchDecisions, searchFeedback, searchIssues } from "@/lib/frontend-data";
import { getIssueForFeedback } from "@/lib/frontend-data";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/upload-feedback", label: "Upload Feedback" },
  { to: "/feedback-explorer", label: "Feedback Explorer" },
  { to: "/issues", label: "Issues" },
  { to: "/product-decisions", label: "Product Decisions" },
  { to: "/cross-domain-insights", label: "Cross-Domain Insights" },
] as const;
const notices = [
  { id: "n1", text: "3 new high-priority issues detected.", to: "/issues" },
  { id: "n2", text: "Payment gateway issue increased by 42%.", to: "/issues" },
  { id: "n3", text: "New feedback batch finished processing.", to: "/feedback-explorer" },
];

function SearchResults({ query, close }: { query: string; close: () => void }) {
  const navigate = useNavigate();
  const matches = useMemo(() => {
    if (query.trim().length < 2) return [];
    return [
      ...searchIssues(query).slice(0, 3).map((item) => ({ type: "Issue", label: item.name, to: "/issues" })),
      ...searchFeedback(query).slice(0, 3).map((item) => ({ type: "Feedback", label: item.text, to: "/feedback-explorer" })),
      ...searchDecisions(query).slice(0, 3).map((item) => ({ type: "Decision", label: item.problem, to: "/product-decisions" })),
    ].slice(0, 7);
  }, [query]);
  if (query.trim().length < 2) return null;
  return <div className="absolute right-0 top-11 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
    <p className="label-mono px-3 pt-3">Search results</p>
    {matches.length ? matches.map((result, index) => <button key={`${result.type}-${index}`} type="button" onClick={() => { close(); navigate({ to: result.to }); }} className="block w-full border-b border-border px-3 py-2 text-left last:border-0 hover:bg-muted">
      <span className="label-mono text-brand">{result.type}</span><span className="mt-0.5 block truncate text-sm">{result.label}</span>
    </button>) : <p className="px-3 py-4 text-sm text-muted-foreground">No results for “{query}”. Try another search.</p>}
  </div>;
}

function Sidebar() {
  return <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-glass backdrop-blur-xl md:flex">
    <div className="flex items-center gap-2.5 px-5 py-5"><div className="grid size-8 place-items-center rounded-lg bg-ink font-display font-semibold text-primary-foreground">I</div><div className="leading-tight"><p className="font-display text-[15px] font-semibold">InsightFlow</p><p className="label-mono mt-0.5">Feedback OS</p></div></div>
    <nav className="mt-2 flex-1 space-y-0.5 px-3 text-sm"><p className="label-mono px-2 pt-2 pb-1.5">Workspace</p>{NAV.map((item) => <Link key={item.to} to={item.to} activeOptions={{ exact: item.to === "/" }} className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-ink/5 data-[status=active]:bg-brand/10 data-[status=active]:font-medium data-[status=active]:text-brand"><span className="size-1.5 rounded-full bg-faint/50 group-data-[status=active]:bg-brand" />{item.label}</Link>)}</nav>
    <div className="glass-inset m-3 p-3"><p className="label-mono">Pipeline</p><p className="mt-1 font-display text-sm font-semibold">1,284 signals</p><p className="text-xs text-muted-foreground">processed today</p></div>
  </aside>;
}

function TopBar({ breadcrumb }: { breadcrumb: string }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<"notifications" | "profile" | null>(null);
  const [read, setRead] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const navigate = useNavigate();
  const feedbackResult = searchFeedback(query)[0];
  const issueResult = searchIssues(query)[0];
  const decisionResult = searchDecisions(query)[0];
  return <header className="sticky top-0 z-30 border-b border-border bg-glass backdrop-blur-xl">
    <div className="flex min-h-14 items-center gap-3 px-4 py-2 sm:px-5">
      <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? <X /> : <Menu />}</Button>
      <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><span className="font-medium text-ink">Analytics</span><span className="text-faint">/</span><span>{breadcrumb}</span></div>
      <div className="relative ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint"/><input aria-label="Search issues, feedback, decisions" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { const target = issueResult ? "/issues" : feedbackResult ? "/feedback-explorer" : decisionResult ? "/product-decisions" : "/feedback-explorer"; navigate({ to: target }); setQuery(""); } if (event.key === "Escape") setQuery(""); }} placeholder="Search issues, feedback, decisions…" className="w-36 rounded-lg border border-border bg-glass-strong py-2 pr-3 pl-9 text-sm placeholder:text-faint focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none sm:w-72"/><SearchResults query={query} close={() => setQuery("")}/></div>
        <div className="relative"><Button variant="outline" size="icon" aria-label="Notifications" aria-expanded={open === "notifications"} onClick={() => setOpen(open === "notifications" ? null : "notifications")}><Bell/>{!read && <span className="absolute right-1 top-1 size-2 rounded-full bg-critical"/>}</Button>{open === "notifications" && <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-popover p-3 shadow-xl"><div className="flex items-center justify-between"><p className="font-display text-sm font-semibold">Notifications</p><Button variant="ghost" size="sm" onClick={() => setRead(true)}><Check/>Mark all read</Button></div>{(read ? [] : notices).map((notice) => <Link key={notice.id} to={notice.to} onClick={() => setOpen(null)} className="mt-2 block rounded-md p-2 text-sm hover:bg-muted">{notice.text}</Link>)}{read && <p className="py-6 text-center text-sm text-muted-foreground">You’re all caught up.</p>}</div>}</div>
        <div className="relative"><Button variant="outline" className="h-9 gap-2 px-1.5 sm:pr-3" aria-label="User profile menu" aria-expanded={open === "profile"} onClick={() => setOpen(open === "profile" ? null : "profile")}><span className="grid size-7 place-items-center rounded-md bg-brand/15 font-display text-xs font-semibold text-brand">AR</span><span className="hidden text-sm font-medium sm:block">Ava Reyes</span><ChevronDown className="hidden size-3 sm:block"/></Button>{open === "profile" && <div className="absolute right-0 top-11 z-50 w-44 rounded-lg border border-border bg-popover p-1 shadow-xl">{["Profile", "Workspace", "Settings", "Sign Out"].map((label) => <button key={label} type="button" onClick={() => { setOpen(null); if (label === "Workspace") navigate({ to: "/" }); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted">{label === "Profile" && <UserRound className="size-4"/>}{label}</button>)}</div>}</div>
      </div>
    </div>
    {mobileNav && <nav className="grid grid-cols-2 gap-1 border-t border-border p-2 md:hidden">{NAV.map((item) => <Link key={item.to} to={item.to} onClick={() => setMobileNav(false)} activeOptions={{ exact: item.to === "/" }} className="rounded-md px-3 py-2 text-sm text-muted-foreground data-[status=active]:bg-brand/10 data-[status=active]:font-medium data-[status=active]:text-brand">{item.label}</Link>)}</nav>}
  </header>;
}
export function AppShell({ breadcrumb, children }: { breadcrumb: string; children: ReactNode }) {
  return <div className="min-h-screen bg-canvas text-ink antialiased"><div className="relative z-10 flex min-h-screen"><Sidebar/><div className="flex min-w-0 flex-1 flex-col"><TopBar breadcrumb={breadcrumb}/><main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 sm:px-5 lg:px-8">{children}</main></div></div></div>;
}
