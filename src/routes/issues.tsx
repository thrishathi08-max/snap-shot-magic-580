import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Sparkline, SentimentBar, IssueTrendChart } from "@/components/charts";
import {
  EmptyState,
  INDUSTRY_OPTIONS,
  IndustryTag,
  PageHeading,
  Panel,
  PanelHeader,
  PriorityBadge,
  PriorityRail,
  PriorityScore,
  Segmented,
  SentimentTag,
  formatDate,
  formatNumber,
  formatTrend,
} from "@/components/ui-kit";
import { getIssues, getFeedbackForIssue } from "@/lib/api";
import { getRelatedDecision } from "@/lib/frontend-data";
import type { IndustryFilter, Issue, PriorityLevel } from "@/lib/types";

export const Route = createFileRoute("/issues")({
  head: () => ({
    meta: [
      { title: "Issues — InsightFlow" },
      {
        name: "description",
        content:
          "Browse all detected product issues, filter by domain and priority, and drill into feedback evidence.",
      },
      { property: "og:title", content: "Issues — InsightFlow" },
      {
        property: "og:description",
        content:
          "Convert aggregated customer feedback into actionable product issues ranked by priority.",
      },
    ],
  }),
  component: IssuesPage,
});

type StatusFilter = "all" | "open" | "investigating" | "resolved";
type PriorityFilter = "all" | PriorityLevel;
type SortField = "priority" | "mentions" | "trend" | "negative";

const STATUS_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
];

const PRIORITY_OPTIONS: readonly { value: PriorityFilter; label: string }[] = [
  { value: "all", label: "All priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const SORT_OPTIONS: readonly { value: SortField; label: string }[] = [
  { value: "priority", label: "Priority score" },
  { value: "mentions", label: "Mentions" },
  { value: "trend", label: "Trend %" },
  { value: "negative", label: "Negative %" },
];

function issueStatus(issue: Issue): StatusFilter {
  if (issue.trendPct < 0) return "resolved";
  if (issue.emerging) return "investigating";
  return "open";
}

const STATUS_STYLES: Record<string, string> = {
  open: "bg-brand/10 text-brand ring-brand/20",
  investigating: "bg-medium-soft text-medium ring-medium/20",
  resolved: "bg-low-soft text-positive ring-low/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 font-mono text-[11px] capitalize ring-1 ${STATUS_STYLES[status] ?? "bg-muted text-muted-foreground ring-border"}`}
    >
      {status}
    </span>
  );
}

function IssueDetail({
  issue,
  onClose,
}: {
  issue: Issue;
  onClose: () => void;
}) {
  const feedback = getFeedbackForIssue(issue.id, 4);
  const decision = getRelatedDecision(issue.id);
  const status = issueStatus(issue);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/30 p-4 pt-12 backdrop-blur-sm sm:pt-16"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-panel w-full max-w-2xl p-0 rise-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge level={issue.priorityLevel} />
              <StatusBadge status={status} />
              <IndustryTag industry={issue.industry} />
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold">
              {issue.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {issue.theme} · {formatNumber(issue.mentions)} mentions ·{" "}
              {formatTrend(issue.trendPct)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-ink/5"
            aria-label="Close details"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-5">
          {/* Priority & Sentiment */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="glass-inset p-4">
              <p className="label-mono">Priority score</p>
              <div className="mt-2 flex items-center gap-3">
                <PriorityScore
                  level={issue.priorityLevel}
                  score={issue.priorityScore}
                  size="lg"
                />
                <div>
                  <p className="text-sm font-medium capitalize">
                    {issue.priorityLevel} priority
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {issue.negativePct}% negative feedback
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-inset p-4">
              <p className="label-mono">Sentiment split</p>
              <div className="mt-3">
                <SentimentBar split={issue.sentiment} />
              </div>
            </div>
          </div>

          {/* Insight */}
          <div>
            <p className="label-mono">Insight</p>
            <p className="mt-2 text-sm leading-relaxed text-pretty">
              {issue.insight}
            </p>
          </div>

          {/* Trend */}
          <div>
            <p className="label-mono">Mention trend (14 periods)</p>
            <div className="mt-2">
              <IssueTrendChart values={issue.trend} />
            </div>
          </div>

          {/* Patterns */}
          <div>
            <p className="label-mono">Key patterns</p>
            <ul className="mt-2 space-y-1.5">
              {issue.patterns.map((pattern) => (
                <li
                  key={pattern}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  {pattern}
                </li>
              ))}
            </ul>
          </div>

          {/* Why prioritized */}
          <div>
            <p className="label-mono">Why prioritized</p>
            <ul className="mt-2 space-y-1.5">
              {issue.whyPrioritized.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-high" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended action */}
          <div className="glass-inset p-4">
            <p className="label-mono">Suggested action</p>
            <p className="mt-2 text-sm font-medium leading-relaxed">
              {issue.recommendedAction}
            </p>
            {decision ? (
              <Link
                to="/product-decisions"
                className="mt-3 inline-block rounded-md bg-brand/10 px-2.5 py-1 font-mono text-[11px] font-medium text-brand transition-colors hover:bg-brand/20"
              >
                View related decision →
              </Link>
            ) : null}
          </div>

          {/* Example feedback */}
          {feedback.length > 0 ? (
            <div>
              <p className="label-mono">
                Related feedback ({feedback.length})
              </p>
              <div className="mt-2 space-y-2">
                {feedback.map((item) => (
                  <div key={item.id} className="glass-inset p-3">
                    <p className="text-sm text-pretty">{item.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <SentimentTag sentiment={item.sentiment} />
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {item.rating}/5
                      </span>
                      <span className="font-mono text-[11px] text-faint">
                        {formatDate(item.date)}
                      </span>
                      <span className="font-mono text-[11px] text-faint">
                        {item.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-glass-strong px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function IssuesPage() {
  const [industry, setIndustry] = useState<IndustryFilter>("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortField>("priority");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const issues = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let list = getIssues(industry);

    if (priorityFilter !== "all") {
      list = list.filter((i) => i.priorityLevel === priorityFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((i) => issueStatus(i) === statusFilter);
    }
    if (needle) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(needle) ||
          i.theme.toLowerCase().includes(needle),
      );
    }

    const sorters: Record<SortField, (a: Issue, b: Issue) => number> = {
      priority: (a, b) => b.priorityScore - a.priorityScore,
      mentions: (a, b) => b.mentions - a.mentions,
      trend: (a, b) => b.trendPct - a.trendPct,
      negative: (a, b) => b.negativePct - a.negativePct,
    };
    return list.sort(sorters[sortBy]);
  }, [industry, search, priorityFilter, statusFilter, sortBy]);

  return (
    <AppShell breadcrumb="Issues">
      <PageHeading
        title="Issues"
        subtitle="Aggregated feedback converted into actionable product issues, ranked by priority."
      >
        <Segmented
          label="Domain"
          options={INDUSTRY_OPTIONS}
          value={industry}
          onChange={setIndustry}
        />
      </PageHeading>

      {/* Filters */}
      <Panel className="mt-6 p-5">
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues by name or theme…"
            className="w-full rounded-lg border border-border bg-glass-strong py-2.5 pr-3 pl-9 text-sm placeholder:text-faint focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="label-mono">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as PriorityFilter)
              }
              className="rounded-lg border border-border bg-glass-strong px-3 py-2 text-sm focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-mono">Status</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="rounded-lg border border-border bg-glass-strong px-3 py-2 text-sm focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-mono">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="rounded-lg border border-border bg-glass-strong px-3 py-2 text-sm focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {/* Issue list */}
      <Panel className="mt-4">
        <div className="border-b border-border px-5 py-4">
          <PanelHeader
            title="Detected issues"
            subtitle={`${formatNumber(issues.length)} ${issues.length === 1 ? "issue" : "issues"} matching filters`}
          />
        </div>

        {issues.length === 0 ? (
          <EmptyState message="No issues match these filters." />
        ) : (
          <div className="divide-y divide-border">
            {issues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => setSelectedIssue(issue)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-ink/[0.025]"
              >
                <PriorityRail level={issue.priorityLevel} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{issue.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {issue.industry === "ecommerce"
                      ? "E-Commerce"
                      : "Restaurant"}{" "}
                    · {issue.theme} · {issue.mentions} mentions ·{" "}
                    {issue.negativePct}% negative
                  </p>
                </div>
                <div className="hidden items-center gap-3 sm:flex">
                  <StatusBadge status={issueStatus(issue)} />
                  <Sparkline values={issue.trend} />
                  <span className="w-14 text-right font-mono text-xs text-muted-foreground">
                    {formatTrend(issue.trendPct)}
                  </span>
                </div>
                <span className="hidden sm:block">
                  <PriorityBadge level={issue.priorityLevel} />
                </span>
                <PriorityScore
                  level={issue.priorityLevel}
                  score={issue.priorityScore}
                />
              </button>
            ))}
          </div>
        )}
      </Panel>

      {selectedIssue ? (
        <IssueDetail
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      ) : null}
    </AppShell>
  );
}
