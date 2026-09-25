import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CompareBars, SentimentBar, Sparkline } from "@/components/charts";
import {
  EmptyState,
  INDUSTRY_OPTIONS,
  IndustryTag,
  PageHeading,
  Panel,
  PanelHeader,
  PriorityBadge,
  Segmented,
  formatNumber,
  formatTrend,
} from "@/components/ui-kit";
import { getCrossThemes, getIssue, getIssues } from "@/lib/api";
import type { CrossTheme, IndustryFilter, Issue } from "@/lib/types";

export const Route = createFileRoute("/cross-domain-insights")({
  head: () => ({
    meta: [
      { title: "Cross-Domain Insights — InsightFlow" },
      {
        name: "description",
        content:
          "Discover patterns appearing across both E-Commerce and Restaurant domains to drive platform-wide improvements.",
      },
      {
        property: "og:title",
        content: "Cross-Domain Insights — InsightFlow",
      },
      {
        property: "og:description",
        content:
          "Shared themes, sentiment comparisons and common pain points across your business domains.",
      },
    ],
  }),
  component: CrossDomainInsightsPage,
});

function getIssuesForTheme(
  issueIds: string[],
): (Issue & { _found: true })[] {
  return issueIds
    .map((id) => getIssue(id))
    .filter(
      (i): i is Issue & { _found: true } => i !== undefined,
    ) as (Issue & { _found: true })[];
}

function ThemeDetail({
  theme,
  onClose,
}: {
  theme: CrossTheme;
  onClose: () => void;
}) {
  const issues = getIssuesForTheme(theme.commonIssueIds);
  const maxMentions = Math.max(
    theme.ecommerceMentions,
    theme.restaurantMentions,
  );
  const totalMentions = theme.ecommerceMentions + theme.restaurantMentions;

  // Compute combined sentiment from linked issues
  const combinedSentiment = issues.reduce(
    (acc, issue) => ({
      positive: acc.positive + issue.sentiment.positive,
      neutral: acc.neutral + issue.sentiment.neutral,
      negative: acc.negative + issue.sentiment.negative,
    }),
    { positive: 0, neutral: 0, negative: 0 },
  );
  const sentimentCount = issues.length || 1;
  const avgSentiment = {
    positive: Math.round(combinedSentiment.positive / sentimentCount),
    neutral: Math.round(combinedSentiment.neutral / sentimentCount),
    negative: Math.round(combinedSentiment.negative / sentimentCount),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/30 p-4 pt-12 backdrop-blur-sm sm:pt-16"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-panel w-full max-w-2xl p-0 rise-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <span className="rounded-md bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-medium text-brand ring-1 ring-brand/20">
              Cross-Domain
            </span>
            <h2 className="mt-3 font-display text-xl font-semibold">
              {theme.theme}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatNumber(totalMentions)} combined mentions across both
              domains
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
          {/* Shared pattern */}
          <div>
            <p className="label-mono">Shared pattern</p>
            <p className="mt-2 text-sm leading-relaxed text-pretty">
              {theme.sharedPattern}
            </p>
          </div>

          {/* Domain comparison */}
          <div>
            <p className="label-mono">Signal volume by domain</p>
            <div className="mt-3">
              <CompareBars
                ecommerce={theme.ecommerceMentions}
                restaurant={theme.restaurantMentions}
                max={maxMentions}
              />
            </div>
          </div>

          {/* Average sentiment */}
          <div>
            <p className="label-mono">Average sentiment (linked issues)</p>
            <div className="mt-3">
              <SentimentBar split={avgSentiment} />
            </div>
          </div>

          {/* Linked issues */}
          {issues.length > 0 ? (
            <div>
              <p className="label-mono">
                Linked issues ({issues.length})
              </p>
              <div className="mt-2 space-y-2">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="glass-inset flex items-center gap-3 p-3"
                  >
                    <PriorityBadge level={issue.priorityLevel} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {issue.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <IndustryTag industry={issue.industry} />{" "}
                        <span className="ml-1">
                          {issue.mentions} mentions ·{" "}
                          {formatTrend(issue.trendPct)}
                        </span>
                      </p>
                    </div>
                    <Sparkline values={issue.trend} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Recommended investigation */}
          <div className="glass-inset p-4">
            <p className="label-mono">Recommended investigation</p>
            <p className="mt-2 text-sm leading-relaxed text-pretty">
              {theme.theme === "Delivery"
                ? "Audit the promise-setting logic in both checkout and order estimation flows. Consider a unified promise engine that accounts for real-time capacity."
                : theme.theme === "Payment"
                  ? "Review all payment failure paths for user-recoverable messaging. Prioritise the paths where the customer cannot retry without support intervention."
                  : theme.theme === "Waiting time"
                    ? "Measure the gap between quoted and actual wait across all touchpoints. A 10% improvement in quote accuracy may halve complaint volume."
                    : theme.theme === "Service quality"
                      ? "Map the customer journey after a failure event. Every failure without proactive acknowledgement doubles negative sentiment."
                      : "Introduce end-of-line checklists at every assembly or packing step. A single ownership point per order reduces errors by up to 40%."}
            </p>
          </div>
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

function CrossDomainInsightsPage() {
  const [search, setSearch] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<CrossTheme | null>(null);

  const themes = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const all = getCrossThemes();
    if (!needle) return all;
    return all.filter(
      (t) =>
        t.theme.toLowerCase().includes(needle) ||
        t.sharedPattern.toLowerCase().includes(needle),
    );
  }, [search]);

  // Summary stats
  const totalEcommerce = themes.reduce(
    (sum, t) => sum + t.ecommerceMentions,
    0,
  );
  const totalRestaurant = themes.reduce(
    (sum, t) => sum + t.restaurantMentions,
    0,
  );
  const globalMax = Math.max(
    ...themes.map((t) =>
      Math.max(t.ecommerceMentions, t.restaurantMentions),
    ),
    1,
  );

  // Get all ecommerce and restaurant issues for comparison
  const ecomIssues = getIssues("ecommerce");
  const restIssues = getIssues("restaurant");

  const ecomAvgNeg =
    ecomIssues.length > 0
      ? Math.round(
          ecomIssues.reduce((s, i) => s + i.negativePct, 0) /
            ecomIssues.length,
        )
      : 0;
  const restAvgNeg =
    restIssues.length > 0
      ? Math.round(
          restIssues.reduce((s, i) => s + i.negativePct, 0) /
            restIssues.length,
        )
      : 0;

  return (
    <AppShell breadcrumb="Cross-Domain Insights">
      <PageHeading
        title="Cross-Domain Insights"
        subtitle="Patterns appearing across both E-Commerce and Restaurant feedback, revealing platform-wide improvement opportunities."
      />

      {/* Summary cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Panel className="p-4">
          <p className="label-mono">Shared themes</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {themes.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            active cross-domain patterns
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="label-mono">E-Commerce signals</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {formatNumber(totalEcommerce)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            avg {ecomAvgNeg}% negative
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="label-mono">Restaurant signals</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {formatNumber(totalRestaurant)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            avg {restAvgNeg}% negative
          </p>
        </Panel>
        <Panel className="p-4">
          <p className="label-mono">Combined volume</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {formatNumber(totalEcommerce + totalRestaurant)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            total cross-domain mentions
          </p>
        </Panel>
      </div>

      {/* Search */}
      <Panel className="mt-4 p-5">
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
            placeholder="Search cross-domain themes…"
            className="w-full rounded-lg border border-border bg-glass-strong py-2.5 pr-3 pl-9 text-sm placeholder:text-faint focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
      </Panel>

      {/* Theme cards */}
      {themes.length === 0 ? (
        <Panel className="mt-4">
          <EmptyState message="No cross-domain themes match this search." />
        </Panel>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {themes.map((theme) => {
            const issues = getIssuesForTheme(theme.commonIssueIds);
            const maxM = Math.max(
              theme.ecommerceMentions,
              theme.restaurantMentions,
            );

            return (
              <Panel key={theme.theme} className="p-0">
                <button
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className="w-full p-5 text-left transition-colors hover:bg-ink/[0.025]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold">
                        {theme.theme}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatNumber(
                          theme.ecommerceMentions +
                            theme.restaurantMentions,
                        )}{" "}
                        combined mentions
                      </p>
                    </div>
                    <span className="rounded-md bg-brand/10 px-2 py-0.5 font-mono text-[11px] font-medium text-brand ring-1 ring-brand/20">
                      Cross-Domain
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {theme.sharedPattern}
                  </p>

                  {/* Domain comparison */}
                  <div className="mt-4">
                    <CompareBars
                      ecommerce={theme.ecommerceMentions}
                      restaurant={theme.restaurantMentions}
                      max={maxM}
                    />
                  </div>

                  {/* Linked issues */}
                  {issues.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {issues.map((issue) => (
                        <span
                          key={issue.id}
                          className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs"
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              issue.priorityLevel === "critical"
                                ? "bg-critical"
                                : issue.priorityLevel === "high"
                                  ? "bg-high"
                                  : issue.priorityLevel === "medium"
                                    ? "bg-medium"
                                    : "bg-low"
                            }`}
                          />
                          <span className="truncate text-muted-foreground">
                            {issue.name}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              </Panel>
            );
          })}
        </div>
      )}

      {/* Common pain points summary */}
      <Panel className="mt-4 p-5">
        <PanelHeader
          title="Common customer pain points"
          subtitle="Themes that appear with high negative sentiment in both domains"
        />
        <div className="mt-4 space-y-3">
          {themes
            .sort(
              (a, b) =>
                b.ecommerceMentions +
                b.restaurantMentions -
                (a.ecommerceMentions + a.restaurantMentions),
            )
            .map((theme) => {
              const issues = getIssuesForTheme(theme.commonIssueIds);
              const avgTrend =
                issues.length > 0
                  ? Math.round(
                      issues.reduce((s, i) => s + i.trendPct, 0) /
                        issues.length,
                    )
                  : 0;

              return (
                <button
                  key={theme.theme}
                  type="button"
                  onClick={() => setSelectedTheme(theme)}
                  className="glass-inset flex w-full items-center gap-4 p-3 text-left transition-colors hover:bg-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{theme.theme}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatNumber(
                        theme.ecommerceMentions +
                          theme.restaurantMentions,
                      )}{" "}
                      mentions · {formatTrend(avgTrend)} avg trend
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <CompareBars
                      ecommerce={theme.ecommerceMentions}
                      restaurant={theme.restaurantMentions}
                      max={globalMax}
                    />
                  </div>
                </button>
              );
            })}
        </div>
      </Panel>

      {selectedTheme ? (
        <ThemeDetail
          theme={selectedTheme}
          onClose={() => setSelectedTheme(null)}
        />
      ) : null}
    </AppShell>
  );
}
