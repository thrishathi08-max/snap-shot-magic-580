import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  EmptyState,
  IndustryTag,
  INDUSTRY_OPTIONS,
  PageHeading,
  Panel,
  PanelHeader,
  Segmented,
  Select,
  SentimentTag,
  formatDate,
  formatNumber,
} from "@/components/ui-kit";
import { DATE_RANGES, getFeedback, getIssues, type DateRange } from "@/lib/api";
import type { IndustryFilter, Sentiment } from "@/lib/types";

export const Route = createFileRoute("/feedback-explorer")({
  head: () => ({
    meta: [
      { title: "Feedback Explorer — InsightFlow" },
      {
        name: "description",
        content:
          "Search and filter raw customer feedback by industry, sentiment, rating, issue cluster and date.",
      },
      { property: "og:title", content: "Feedback Explorer — InsightFlow" },
      {
        property: "og:description",
        content:
          "Every insight stays traceable back to the individual customer comments behind it.",
      },
    ],
  }),
  component: ExplorerPage,
});

const SENTIMENT_OPTIONS = [
  { value: "all" as const, label: "All sentiment" },
  { value: "positive" as const, label: "Positive" },
  { value: "neutral" as const, label: "Neutral" },
  { value: "negative" as const, label: "Negative" },
];

const RATING_OPTIONS = [
  { value: "all" as const, label: "All ratings" },
  { value: 5, label: "5 stars" },
  { value: 4, label: "4 stars" },
  { value: 3, label: "3 stars" },
  { value: 2, label: "2 stars" },
  { value: 1, label: "1 star" },
];

function ExplorerPage() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<IndustryFilter>("all");
  const [sentiment, setSentiment] = useState<Sentiment | "all">("all");
  const [rating, setRating] = useState<number | "all">("all");
  const [issueId, setIssueId] = useState<string | "all">("all");
  const [days, setDays] = useState<DateRange>(90);

  const issueOptions = useMemo(
    () => [
      { value: "all" as const, label: "All issues" },
      ...getIssues(industry).map((issue) => ({
        value: issue.id,
        label: issue.name,
      })),
    ],
    [industry],
  );

  const rows = getFeedback({
    search,
    industry,
    sentiment,
    rating,
    issueId,
    days,
  });

  return (
    <AppShell breadcrumb="Feedback Explorer">
      <PageHeading
        title="Feedback Explorer"
        subtitle="The raw evidence layer. Every issue and decision traces back to these entries."
      >
        <Segmented
          label="Industry"
          options={INDUSTRY_OPTIONS}
          value={industry}
          onChange={setIndustry}
        />
      </PageHeading>

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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feedback text…"
            className="w-full rounded-lg border border-border bg-glass-strong py-2.5 pr-3 pl-9 text-sm placeholder:text-faint focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Sentiment"
            value={sentiment}
            options={SENTIMENT_OPTIONS}
            onChange={setSentiment}
          />
          <Select
            label="Rating"
            value={rating}
            options={RATING_OPTIONS}
            onChange={setRating}
          />
          <Select
            label="Issue"
            value={issueId}
            options={issueOptions}
            onChange={setIssueId}
          />
          <Select
            label="Date range"
            value={days}
            options={DATE_RANGES.map((range) => ({
              value: range.value as DateRange,
              label: range.label,
            }))}
            onChange={setDays}
          />
        </div>
      </Panel>

      <Panel className="mt-4">
        <div className="border-b border-border px-5 py-4">
          <PanelHeader
            title="Feedback entries"
            subtitle={`${formatNumber(rows.length)} matching ${rows.length === 1 ? "entry" : "entries"}`}
          />
        </div>

        {rows.length === 0 ? (
          <EmptyState message="No feedback matches these filters." />
        ) : (
          <div className="divide-y divide-border">
            {rows.map((item) => (
              <article
                key={item.id}
                className="px-5 py-4 transition-colors hover:bg-ink/[0.025]"
              >
                <p className="text-sm text-pretty">{item.text}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <IndustryTag industry={item.industry} />
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
              </article>
            ))}
          </div>
        )}
      </Panel>
    </AppShell>
  );
}
