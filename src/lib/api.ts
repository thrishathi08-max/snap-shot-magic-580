// Data access layer.
//
// The Dashboard and Feedback Explorer use the FastAPI backend.
// Existing synchronous helpers are kept for pages that have not
// been migrated to the backend yet.

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

const API_BASE = "http://127.0.0.1:8000";

/** Fixed "today" used by the current demo data. */
export const TODAY = "2026-09-25";

export const DATE_RANGES = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
] as const;

export type DateRange = (typeof DATE_RANGES)[number]["value"];

function matchesIndustry(
  industry: string,
  filter: IndustryFilter,
): boolean {
  return filter === "all" || industry === filter;
}

/* -------------------------------------------------------------------------- */
/* Backend helper                                                             */
/* -------------------------------------------------------------------------- */

async function fetchJson<T>(
  path: string,
  params?: Record<string, string | number>,
): Promise<T> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });
  }

  const query = searchParams.toString();
  const url = `${API_BASE}${path}${query ? `?${query}` : ""}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

/* -------------------------------------------------------------------------- */
/* Dashboard backend data                                                     */
/* -------------------------------------------------------------------------- */

export interface DashboardData {
  metrics: Metrics;
  trend: TrendPoint[];
  issues: Issue[];
  emerging: Issue[];
}

/**
 * Loads all Dashboard data from the FastAPI backend.
 *
 * This is intentionally separate from the older synchronous helpers below.
 * That lets us migrate the application page-by-page without breaking
 * existing screens that still expect synchronous functions.
 */
export async function getDashboardData(
  industry: IndustryFilter = "all",
  days: DateRange = 30,
): Promise<DashboardData> {
  const backendIndustry =
    industry === "all" ? "all" : industry;

  const [metrics, trend, issues] = await Promise.all([
    fetchJson<Metrics>("/metrics", {
      industry: backendIndustry,
      days,
    }),

    fetchJson<TrendPoint[]>("/sentiment/trend", {
      industry: backendIndustry,
      days,
    }),

    fetchJson<Issue[]>("/issues", {
      industry: backendIndustry,
      days,
    }),
  ]);

  const emerging = issues
    .filter(
      (issue) =>
        issue.emerging ||
        issue.trendPct >= 40,
    )
    .sort(
      (a, b) =>
        b.trendPct - a.trendPct,
    );

  return {
    metrics,
    trend,
    issues,
    emerging,
  };
}

/* -------------------------------------------------------------------------- */
/* Issues                                                                     */
/* -------------------------------------------------------------------------- */

export function getIssues(
  industry: IndustryFilter = "all",
): Issue[] {
  return allIssues
    .filter((issue) =>
      matchesIndustry(issue.industry, industry),
    )
    .sort(
      (a, b) =>
        b.priorityScore - a.priorityScore,
    );
}

export function getIssue(
  id: string,
): Issue | undefined {
  return allIssues.find(
    (issue) => issue.id === id,
  );
}

export function getEmergingIssues(
  industry: IndustryFilter = "all",
): Issue[] {
  return getIssues(industry)
    .filter(
      (issue) =>
        issue.emerging ||
        issue.trendPct >= 40,
    )
    .sort(
      (a, b) =>
        b.trendPct - a.trendPct,
    );
}

/* -------------------------------------------------------------------------- */
/* Metrics                                                                    */
/* -------------------------------------------------------------------------- */

export function getMetrics(
  industry: IndustryFilter = "all",
  days: DateRange = 30,
): Metrics {
  const issues = getIssues(industry);

  const scale =
    days === 7
      ? 0.26
      : days === 90
        ? 2.7
        : 1;

  const mentions = issues.reduce(
    (sum, issue) =>
      sum + issue.mentions,
    0,
  );

  const negative = issues.reduce(
    (sum, issue) =>
      sum +
      Math.round(
        (issue.mentions *
          issue.negativePct) /
        100,
      ),
    0,
  );

  const total = Math.round(
    mentions * 6.1 * scale,
  );

  return {
    totalFeedback: total,
    negativeFeedback:
      Math.round(
        negative * scale,
      ),
    detectedIssues:
      issues.length,
    highPriorityIssues:
      issues.filter(
        (issue) =>
          issue.priorityLevel ===
          "critical" ||
          issue.priorityLevel === "high",
      ).length,
    totalDelta: 8.2,
    negativeDelta: 3.1,
    newIssues:
      issues.filter(
        (issue) => issue.emerging,
      ).length,
    highPriorityDelta: 5,
  };
}

/* -------------------------------------------------------------------------- */
/* Sentiment                                                                  */
/* -------------------------------------------------------------------------- */

export function getSentimentTrend(
  days: DateRange = 30,
): TrendPoint[] {
  if (
    days >=
    sentimentTrend.length
  ) {
    return sentimentTrend;
  }

  return sentimentTrend.slice(-days);
}

/* -------------------------------------------------------------------------- */
/* Feedback                                                                   */
/* -------------------------------------------------------------------------- */

export interface FeedbackQuery {
  search?: string;
  industry?: IndustryFilter;
  sentiment?: Sentiment | "all";
  rating?: number | "all";
  issueId?: string | "all";
  days?: DateRange;
}

/**
 * Feedback Explorer uses the real FastAPI backend.
 */
export async function getFeedback(
  query: FeedbackQuery = {},
): Promise<Feedback[]> {
  const {
    search = "",
    industry = "all",
    sentiment = "all",
    rating = "all",
    issueId = "all",
    days = 90,
  } = query;

  const params = new URLSearchParams();

  params.set(
    "industry",
    industry,
  );

  params.set(
    "sentiment",
    sentiment,
  );

  params.set(
    "rating",
    String(rating),
  );

  params.set(
    "issue_id",
    issueId,
  );

  params.set(
    "days",
    String(days),
  );

  if (search.trim()) {
    params.set(
      "search",
      search.trim(),
    );
  }

  const response = await fetch(
    `${API_BASE}/feedback?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch feedback: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as Feedback[];

  return data;
}

/**
 * Used by the existing Issues page.
 *
 * This remains local/synchronous for now so that
 * the rest of the application does not need to
 * become async at the same time.
 */
export function getFeedbackForIssue(
  issueId: string,
  limit = 4,
): Feedback[] {
  return allFeedback
    .filter((item) =>
      item.issueIds.includes(
        issueId,
      ),
    )
    .sort(
      (a, b) =>
        a.date < b.date
          ? 1
          : -1,
    )
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Decisions                                                                  */
/* -------------------------------------------------------------------------- */

export function getDecisions(
  industry: IndustryFilter = "all",
): Decision[] {
  const impactRank = {
    high: 0,
    medium: 1,
    low: 2,
  } as const;

  return allDecisions
    .filter((decision) => {
      const issue =
        getIssue(
          decision.relatedIssueId,
        );

      return issue
        ? matchesIndustry(
          issue.industry,
          industry,
        )
        : true;
    })
    .sort(
      (a, b) =>
        impactRank[a.impact] -
        impactRank[b.impact] ||
        b.affectedFeedback -
        a.affectedFeedback,
    );
}

/* -------------------------------------------------------------------------- */
/* Cross-domain insights                                                      */
/* -------------------------------------------------------------------------- */

export function getCrossThemes(): CrossTheme[] {
  return crossThemes;
}

/* -------------------------------------------------------------------------- */
/* Upload / analysis                                                          */
/* -------------------------------------------------------------------------- */

export interface AnalyzeResult {
  rowsProcessed: number;
  newIssues: number;
  negativeShare: number;
  topIssue: string;
}

/**
 * Temporary stand-in for POST /analyze.
 */
export async function analyzeUpload(
  file: File,
  industry: "ecommerce" | "restaurant",
): Promise<AnalyzeResult> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE}/analyze?industry=${industry}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Analysis failed: ${response.status}`,
    );
  }

  const data = await response.json();

  return {
    rowsProcessed: data.rowsProcessed ?? 0,
    newIssues: data.issues?.length ?? 0,
    negativeShare: data.negativeShare ?? 0,
    topIssue: data.topIssue ?? "Unclassified feedback",
  };
}

/* -------------------------------------------------------------------------- */
/* Pipeline                                                                   */
/* -------------------------------------------------------------------------- */

export const PIPELINE_STAGES = [
  "Parsing feedback",
  "Sentiment analysis",
  "Issue detection",
  "Issue clustering",
  "Trend detection",
  "Priority scoring",
  "Generating insights",
] as const;