// Domain model for InsightFlow. Shapes mirror the planned FastAPI response
// bodies so the mock layer in api.ts can be swapped for REST calls 1:1.

export type Industry = "ecommerce" | "restaurant";
export type IndustryFilter = "all" | Industry;
export type Sentiment = "positive" | "neutral" | "negative";
export type PriorityLevel = "critical" | "high" | "medium" | "low";
export type Impact = "high" | "medium" | "low";

export interface Feedback {
  id: string;
  text: string;
  industry: Industry;
  rating: number;
  sentiment: Sentiment;
  date: string; // ISO date
  source: string;
  issueIds: string[];
}

export interface SentimentSplit {
  positive: number;
  neutral: number;
  negative: number;
}

export interface Issue {
  id: string;
  name: string;
  industry: Industry;
  theme: string;
  mentions: number;
  negativePct: number;
  trendPct: number;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  sentiment: SentimentSplit;
  trend: number[];
  patterns: string[];
  whyPrioritized: string[];
  insight: string;
  recommendedAction: string;
  emerging: boolean;
}

export interface Decision {
  id: string;
  problem: string;
  recommendedAction: string;
  evidence: string[];
  affectedFeedback: number;
  impact: Impact;
  impactNote: string;
  relatedIssueId: string;
}

export interface CrossTheme {
  theme: string;
  ecommerceMentions: number;
  restaurantMentions: number;
  sharedPattern: string;
  commonIssueIds: string[];
}

export interface TrendPoint {
  date: string;
  positive: number;
  negative: number;
}

export interface Metrics {
  totalFeedback: number;
  negativeFeedback: number;
  detectedIssues: number;
  highPriorityIssues: number;
  totalDelta: number;
  negativeDelta: number;
  newIssues: number;
  highPriorityDelta: number;
}
