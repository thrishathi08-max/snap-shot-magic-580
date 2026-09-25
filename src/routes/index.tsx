import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ChartLegend, TrendChart } from "@/components/charts";
import {
  DateRangeSelect,
  INDUSTRY_OPTIONS,
  Panel,
  PanelHeader,
  PageHeading,
  PriorityBadge,
  PriorityRail,
  PriorityScore,
  Segmented,
  StatCard,
  formatNumber,
  formatTrend,
} from "@/components/ui-kit";
import {
  getEmergingIssues,
  getIssues,
  getMetrics,
  getSentimentTrend,
  type DateRange,
} from "@/lib/api";
import type { IndustryFilter } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — InsightFlow Feedback Intelligence" },
      {
        name: "description",
        content:
          "Track feedback volume, sentiment trend, detected issues and high-priority clusters across E-Commerce and Restaurant feedback.",
      },
      { property: "og:title", content: "InsightFlow — Feedback Triage Dashboard" },
      {
        property: "og:description",
        content:
          "Turn unstructured customer feedback into ranked, traceable product issues and decisions.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [industry, setIndustry] = useState<IndustryFilter>("all");
  const [days, setDays] = useState<DateRange>(30);

  const metrics = getMetrics(industry, days);
  const trend = getSentimentTrend(days);
  const issues = getIssues(industry).slice(0, 5);
  const emerging = getEmergingIssues(industry).slice(0, 3);

  return (
    <AppShell breadcrumb="Dashboard">
      <PageHeading
        title="Feedback Triage"
        subtitle="Raw signal sorted into ranked, actionable issues across your domains."
      >
        <Segmented
          label="Industry"
          options={INDUSTRY_OPTIONS}
          value={industry}
          onChange={setIndustry}
        />
        <DateRangeSelect value={days} onChange={setDays} />
      </PageHeading>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total feedback"
          value={formatNumber(metrics.totalFeedback)}
          delta={`▲ ${metrics.totalDelta}% vs prior period`}
          tone="positive"
        />
        <StatCard
          label="Negative feedback"
          value={formatNumber(metrics.negativeFeedback)}
          delta={`▲ ${metrics.negativeDelta}% vs prior period`}
          tone="negative"
        />
        <StatCard
          label="Detected issues"
          value={formatNumber(metrics.detectedIssues)}
          delta={`${metrics.newIssues} new this week`}
        />
        <StatCard
          label="High-priority"
          value={formatNumber(metrics.highPriorityIssues)}
          delta={`▲ ${metrics.highPriorityDelta} since yesterday`}
          tone="warn"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <PanelHeader
            title="Sentiment trend"
            subtitle="Daily net sentiment over the selected period"
            action={<ChartLegend />}
          />
          <div className="mt-4">
            <TrendChart points={trend} />
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelHeader
            title="Emerging issues"
            action={
              <span className="rounded-full bg-brand/10 px-2 py-0.5 font-mono text-[10px] font-medium text-brand">
                LIVE
              </span>
            }
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Signals rising faster than baseline
          </p>
          <div className="mt-4 space-y-3">
            {emerging.map((issue) => (
              <Link
                key={issue.id}
                to="/issues/$issueId"
                params={{ issueId: issue.id }}
                className="glass-inset block p-3 transition-colors hover:bg-card"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{issue.name}</p>
                  <span className="shrink-0 font-mono text-xs text-brand">
                    +{issue.trendPct}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {issue.industry === "ecommerce" ? "E-Commerce" : "Restaurant"}{" "}
                  · {issue.mentions} mentions
                </p>
              </Link>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-4">
        <div className="border-b border-border px-5 py-4">
          <PanelHeader
            title="Top issues"
            subtitle="Ranked by priority score"
            action={
              <Link
                to="/issues"
                className="rounded-lg border border-border bg-glass-strong px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card"
              >
                View all
              </Link>
            }
          />
        </div>
        <div className="divide-y divide-border">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to="/issues/$issueId"
              params={{ issueId: issue.id }}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink/[0.025]"
            >
              <PriorityRail level={issue.priorityLevel} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{issue.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {issue.industry === "ecommerce" ? "E-Commerce" : "Restaurant"}{" "}
                  · {issue.mentions} mentions · {issue.negativePct}% negative ·{" "}
                  {formatTrend(issue.trendPct)}
                </p>
              </div>
              <span className="hidden sm:block">
                <PriorityBadge level={issue.priorityLevel} />
              </span>
              <PriorityScore
                level={issue.priorityLevel}
                score={issue.priorityScore}
              />
            </Link>
          ))}
        </div>
      </Panel>
    </AppShell>
  );
}
