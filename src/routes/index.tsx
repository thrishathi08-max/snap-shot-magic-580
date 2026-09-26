import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  getDashboardData,
  type DateRange,
} from "@/lib/api";
import type {
  IndustryFilter,
  Issue,
  Metrics,
  TrendPoint,
} from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Dashboard — InsightFlow Feedback Intelligence",
      },
      {
        name: "description",
        content:
          "Track feedback volume, sentiment trend, detected issues and high-priority clusters across E-Commerce and Restaurant feedback.",
      },
      {
        property: "og:title",
        content:
          "InsightFlow — Feedback Triage Dashboard",
      },
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
  const [industry, setIndustry] =
    useState<IndustryFilter>("all");

  const [days, setDays] =
    useState<DateRange>(30);

  const [metrics, setMetrics] =
    useState<Metrics | null>(null);

  const [trend, setTrend] =
    useState<TrendPoint[]>([]);

  const [issues, setIssues] =
    useState<Issue[]>([]);

  const [emerging, setEmerging] =
    useState<Issue[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const data =
          await getDashboardData(
            industry,
            days,
          );

        if (cancelled) {
          return;
        }

        setMetrics(data.metrics);
        setTrend(data.trend);
        setIssues(data.issues);
        setEmerging(data.emerging);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard data.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [industry, days]);

  const topIssues =
    issues.slice(0, 5);

  const topEmerging =
    emerging.slice(0, 3);

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

        <DateRangeSelect
          value={days}
          onChange={setDays}
        />
      </PageHeading>

      {error && (
        <Panel className="mt-6 p-5">
          <p className="text-sm font-medium text-destructive">
            Unable to load dashboard data
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {error}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Make sure the FastAPI backend is running on
            127.0.0.1:8000.
          </p>
        </Panel>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total feedback"
          value={
            loading || !metrics
              ? "—"
              : formatNumber(
                  metrics.totalFeedback,
                )
          }
          delta={
            loading || !metrics
              ? "Loading..."
              : `▲ ${metrics.totalDelta}% vs prior period`
          }
          tone="positive"
        />

        <StatCard
          label="Negative feedback"
          value={
            loading || !metrics
              ? "—"
              : formatNumber(
                  metrics.negativeFeedback,
                )
          }
          delta={
            loading || !metrics
              ? "Loading..."
              : `▲ ${metrics.negativeDelta}% vs prior period`
          }
          tone="negative"
        />

        <StatCard
          label="Detected issues"
          value={
            loading || !metrics
              ? "—"
              : formatNumber(
                  metrics.detectedIssues,
                )
          }
          delta={
            loading || !metrics
              ? "Loading..."
              : `${metrics.newIssues} new this week`
          }
        />

        <StatCard
          label="High-priority"
          value={
            loading || !metrics
              ? "—"
              : formatNumber(
                  metrics.highPriorityIssues,
                )
          }
          delta={
            loading || !metrics
              ? "Loading..."
              : `▲ ${metrics.highPriorityDelta} since yesterday`
          }
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
            {loading ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Loading sentiment trend...
              </div>
            ) : (
              <TrendChart points={trend} />
            )}
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
            {loading ? (
              <p className="text-sm text-muted-foreground">
                Loading...
              </p>
            ) : topEmerging.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No emerging issues found.
              </p>
            ) : (
              topEmerging.map((issue) => (
                <Link
                  key={issue.id}
                  to="/issues"
                  className="glass-inset block p-3 transition-colors hover:bg-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      {issue.name}
                    </p>

                    <span className="shrink-0 font-mono text-xs text-brand">
                      +{issue.trendPct}%
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {issue.industry ===
                    "ecommerce"
                      ? "E-Commerce"
                      : "Restaurant"}{" "}
                    · {issue.mentions} mentions
                  </p>
                </Link>
              ))
            )}
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
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              Loading issues...
            </div>
          ) : topIssues.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No issues found.
            </div>
          ) : (
            topIssues.map((issue) => (
              <Link
                key={issue.id}
                to="/issues"
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-ink/[0.025]"
              >
                <PriorityRail
                  level={issue.priorityLevel}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {issue.name}
                  </p>

                  <p className="truncate text-xs text-muted-foreground">
                    {issue.industry ===
                    "ecommerce"
                      ? "E-Commerce"
                      : "Restaurant"}{" "}
                    · {issue.mentions} mentions ·{" "}
                    {issue.negativePct}% negative ·{" "}
                    {formatTrend(
                      issue.trendPct,
                    )}
                  </p>
                </div>

                <span className="hidden sm:block">
                  <PriorityBadge
                    level={
                      issue.priorityLevel
                    }
                  />
                </span>

                <PriorityScore
                  level={
                    issue.priorityLevel
                  }
                  score={
                    issue.priorityScore
                  }
                />
              </Link>
            ))
          )}
        </div>
      </Panel>
    </AppShell>
  );
}