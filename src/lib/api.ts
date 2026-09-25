// Data access layer.
//
// Every function here is the single swap point for the future Python FastAPI
// backend: the shapes returned match the planned REST responses, so replacing a
// body with `fetch(`${API_BASE}/...`)` requires no component changes.
//
//   getMetrics        -> GET /metrics?industry=&days=
//   getSentimentTrend -> GET /sentiment/trend?industry=&days=
//   getIssues         -> GET /issues?industry=&days=
//   getIssue          -> GET /issues/{id}
//   getFeedback       -> GET /feedback?search=&industry=&sentiment=&rating=&issue=&days=
//   getDecisions      -> GET /decisions?industry=
//   getCrossThemes    -> GET /insights/cross-domain
//   analyzeUpload     -> POST /analyze  (multipart CSV + industry)

import {
  crossThemes,
  decisions as allDecisions,
  feedback as allFeedback,
  issues as allIssues,
  sentimentTrend,
} from "./mock-data";
import type {
  CrossTheme,
  Decision,
  Feedback,
  IndustryFilter,
  Issue,
  Metrics,
  Sentiment,
  TrendPoint,
} from "./types";

/** Fixed "today" so the mock date filters behave deterministically in a demo. */
export const TODAY = "2026-09-25";

export const DATE_RANGES = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
] as const;

export type DateRange = (typeof DATE_RANGES)[number]["value"];

function withinRange(date: string, days: number): boolean {
  const end = new Date(`${TODAY}T00:00:00Z`).getTime();
  const start = end - (days - 1) * 86_400_000;
  const value = new Date(`${date}T00:00:00Z`).getTime();
  return value >= start && value <= end;
}

function matchesIndustry(industry: string, filter: IndustryFilter): boolean {
  return filter === "all" || industry === filter;
}

export function getIssues(
  industry: IndustryFilter = "all",
): Issue[] {
  return allIssues
    .filter((issue) => matchesIndustry(issue.industry, industry))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getIssue(id: string): Issue | undefined {
  return allIssues.find((issue) => issue.id === id);
}

export function getEmergingIssues(industry: IndustryFilter = "all"): Issue[] {
  return getIssues(industry)
    .filter((issue) => issue.emerging || issue.trendPct >= 40)
    .sort((a, b) => b.trendPct - a.trendPct);
}

export function getMetrics(
  industry: IndustryFilter = "all",
  days: DateRange = 30,
): Metrics {
  const issues = getIssues(industry);
  const scale = days === 7 ? 0.26 : days === 90 ? 2.7 : 1;
  const mentions = issues.reduce((sum, i) => sum + i.mentions, 0);
  const negative = issues.reduce(
    (sum, i) => sum + Math.round((i.mentions * i.negativePct) / 100),
    0,
  );
  const total = Math.round(mentions * 6.1 * scale);

  return {
    totalFeedback: total,
    negativeFeedback: Math.round(negative * scale),
    detectedIssues: issues.length,
    highPriorityIssues: issues.filter(
      (i) => i.priorityLevel === "critical" || i.priorityLevel === "high",
    ).length,
    totalDelta: 8.2,
    negativeDelta: 3.1,
    newIssues: issues.filter((i) => i.emerging).length,
    highPriorityDelta: 5,
  };
}

export function getSentimentTrend(days: DateRange = 30): TrendPoint[] {
  if (days >= sentimentTrend.length) return sentimentTrend;
  return sentimentTrend.slice(-days);
}

export interface FeedbackQuery {
  search?: string;
  industry?: IndustryFilter;
  sentiment?: Sentiment | "all";
  rating?: number | "all";
  issueId?: string | "all";
  days?: DateRange;
}

export function getFeedback(query: FeedbackQuery = {}): Feedback[] {
  const {
    search = "",
    industry = "all",
    sentiment = "all",
    rating = "all",
    issueId = "all",
    days = 90,
  } = query;
  const needle = search.trim().toLowerCase();

  return allFeedback
    .filter((item) => matchesIndustry(item.industry, industry))
    .filter((item) => sentiment === "all" || item.sentiment === sentiment)
    .filter((item) => rating === "all" || item.rating === rating)
    .filter((item) => issueId === "all" || item.issueIds.includes(issueId))
    .filter((item) => withinRange(item.date, days))
    .filter((item) => !needle || item.text.toLowerCase().includes(needle))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getFeedbackForIssue(issueId: string, limit = 4): Feedback[] {
  return allFeedback
    .filter((item) => item.issueIds.includes(issueId))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}

export function getDecisions(industry: IndustryFilter = "all"): Decision[] {
  const impactRank = { high: 0, medium: 1, low: 2 } as const;
  return allDecisions
    .filter((decision) => {
      const issue = getIssue(decision.relatedIssueId);
      return issue ? matchesIndustry(issue.industry, industry) : true;
    })
    .sort(
      (a, b) =>
        impactRank[a.impact] - impactRank[b.impact] ||
        b.affectedFeedback - a.affectedFeedback,
    );
}

export function getCrossThemes(): CrossTheme[] {
  return crossThemes;
}

export interface AnalyzeResult {
  rowsProcessed: number;
  newIssues: number;
  negativeShare: number;
  topIssue: string;
}

/** Stand-in for POST /analyze. Resolves after a simulated pipeline run. */
export function analyzeUpload(
  fileName: string,
  industry: "ecommerce" | "restaurant",
): Promise<AnalyzeResult> {
  const rows = 400 + (fileName.length % 7) * 137;
  const issues = getIssues(industry);
  return new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          rowsProcessed: rows,
          newIssues: issues.filter((i) => i.emerging).length + 2,
          negativeShare: industry === "ecommerce" ? 19 : 23,
          topIssue: issues[0]?.name ?? "Unclassified feedback",
        }),
      2600,
    );
  });
}

export const PIPELINE_STAGES = [
  "Parsing feedback",
  "Sentiment analysis",
  "Issue detection",
  "Issue clustering",
  "Trend detection",
  "Priority scoring",
  "Generating insights",
] as const;
