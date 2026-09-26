import type {
  CrossTheme,
  Decision,
  Feedback,
  Issue,
  Metrics,
  TrendPoint,
} from "../lib/types";

const feedback: Feedback[] = [
  {
    id: "fb-001",
    text: "Checkout keeps failing on my phone.",
    industry: "ecommerce",
    rating: 2,
    sentiment: "negative",
    date: "2026-09-25",
    source: "App Store",
    issueIds: ["issue-001"],
  },
  {
    id: "fb-002",
    text: "The payment button is difficult to tap on mobile.",
    industry: "ecommerce",
    rating: 2,
    sentiment: "negative",
    date: "2026-09-25",
    source: "App Store",
    issueIds: ["issue-001"],
  },
  {
    id: "fb-003",
    text: "Checkout page takes too long to load.",
    industry: "ecommerce",
    rating: 2,
    sentiment: "negative",
    date: "2026-09-24",
    source: "Google Review",
    issueIds: ["issue-002"],
  },
  {
    id: "fb-004",
    text: "The restaurant staff were very helpful.",
    industry: "restaurant",
    rating: 5,
    sentiment: "positive",
    date: "2026-09-25",
    source: "Google Review",
    issueIds: [],
  },
  {
    id: "fb-005",
    text: "Food arrived cold after waiting for a long time.",
    industry: "restaurant",
    rating: 2,
    sentiment: "negative",
    date: "2026-09-24",
    source: "In-app Survey",
    issueIds: ["issue-003"],
  },
];

const issues: Issue[] = [
  {
    id: "issue-001",
    name: "Mobile checkout usability",
    industry: "ecommerce",
    theme: "Checkout",
    mentions: 18,
    negativePct: 89,
    trendPct: 24,
    priorityScore: 92,
    priorityLevel: "critical",
    sentiment: {
      positive: 2,
      neutral: 1,
      negative: 15,
    },
    trend: [8, 10, 11, 13, 12, 16, 18],
    patterns: [
      "Mobile users report checkout interaction problems",
      "Payment controls are difficult to use",
      "Complaints increased during the last week",
    ],
    whyPrioritized: [
      "High negative sentiment",
      "Large number of mentions",
      "Direct impact on checkout completion",
    ],
    insight:
      "Multiple users are reporting friction during mobile checkout, especially around payment interaction.",
    recommendedAction:
      "Review mobile checkout layout and test payment controls across common screen sizes.",
    emerging: true,
  },
  {
    id: "issue-002",
    name: "Slow checkout performance",
    industry: "ecommerce",
    theme: "Performance",
    mentions: 11,
    negativePct: 82,
    trendPct: 14,
    priorityScore: 78,
    priorityLevel: "high",
    sentiment: {
      positive: 1,
      neutral: 1,
      negative: 9,
    },
    trend: [4, 5, 6, 7, 8, 9, 11],
    patterns: [
      "Checkout loading time is frequently mentioned",
      "Users report delays before payment",
    ],
    whyPrioritized: [
      "High negative sentiment",
      "Growing number of complaints",
    ],
    insight:
      "Customers are experiencing delays while moving through the checkout flow.",
    recommendedAction:
      "Profile checkout API and frontend loading performance.",
    emerging: true,
  },
  {
    id: "issue-003",
    name: "Food temperature complaints",
    industry: "restaurant",
    theme: "Food Quality",
    mentions: 9,
    negativePct: 76,
    trendPct: 8,
    priorityScore: 64,
    priorityLevel: "medium",
    sentiment: {
      positive: 1,
      neutral: 1,
      negative: 7,
    },
    trend: [3, 4, 4, 5, 6, 7, 9],
    patterns: [
      "Customers mention food arriving cold",
      "Long waiting times are associated with complaints",
    ],
    whyPrioritized: [
      "Repeated negative feedback",
      "Direct effect on customer satisfaction",
    ],
    insight:
      "Food temperature complaints appear to be connected with longer waiting times.",
    recommendedAction:
      "Review preparation-to-delivery timing and serving workflow.",
    emerging: false,
  },
];

const decisions: Decision[] = [
  {
    id: "decision-001",
    problem: "Mobile checkout usability",
    recommendedAction:
      "Redesign mobile checkout controls and validate them across common screen sizes.",
    evidence: [
      "18 related feedback mentions",
      "89% negative sentiment",
      "24% upward trend",
    ],
    affectedFeedback: 18,
    impact: "high",
    impactNote: "Checkout friction can directly affect purchase completion.",
    relatedIssueId: "issue-001",
  },
  {
    id: "decision-002",
    problem: "Slow checkout performance",
    recommendedAction:
      "Investigate checkout API and frontend loading bottlenecks.",
    evidence: [
      "11 related feedback mentions",
      "82% negative sentiment",
      "14% upward trend",
    ],
    affectedFeedback: 11,
    impact: "high",
    impactNote: "Slow checkout can increase abandonment.",
    relatedIssueId: "issue-002",
  },
];

const crossThemes: CrossTheme[] = [
  {
    theme: "Waiting Time",
    ecommerceMentions: 11,
    restaurantMentions: 9,
    sharedPattern:
      "Customers across both domains complain when service takes longer than expected.",
    commonIssueIds: ["issue-002", "issue-003"],
  },
  {
    theme: "User Experience Friction",
    ecommerceMentions: 18,
    restaurantMentions: 5,
    sharedPattern:
      "Negative experiences increase when users encounter friction during important interactions.",
    commonIssueIds: ["issue-001", "issue-003"],
  },
];

const trend: TrendPoint[] = [
  {
    date: "2026-09-19",
    positive: 42,
    negative: 18,
  },
  {
    date: "2026-09-20",
    positive: 45,
    negative: 20,
  },
  {
    date: "2026-09-21",
    positive: 43,
    negative: 22,
  },
  {
    date: "2026-09-22",
    positive: 48,
    negative: 21,
  },
  {
    date: "2026-09-23",
    positive: 51,
    negative: 25,
  },
  {
    date: "2026-09-24",
    positive: 53,
    negative: 28,
  },
  {
    date: "2026-09-25",
    positive: 56,
    negative: 31,
  },
];

export function getFeedback(): Feedback[] {
  return feedback;
}

export function getFeedbackById(id: string): Feedback | undefined {
  return feedback.find((item) => item.id === id);
}

export function addFeedback(item: Feedback): Feedback {
  feedback.unshift(item);
  return item;
}

export function getIssues(): Issue[] {
  return issues;
}

export function getIssueById(id: string): Issue | undefined {
  return issues.find((item) => item.id === id);
}

export function addIssue(issue: Issue): Issue {
  issues.unshift(issue);
  return issue;
}

export function updateIssue(
  id: string,
  updates: Partial<Issue>,
): Issue | undefined {
  const issue = issues.find((item) => item.id === id);

  if (!issue) {
    return undefined;
  }

  Object.assign(issue, updates, {
    updatedAt: new Date().toISOString(),
  });

  return issue;
}

export function getDecisions(): Decision[] {
  return decisions;
}

export function getDecisionById(id: string): Decision | undefined {
  return decisions.find((item) => item.id === id);
}

export function addDecision(decision: Decision): Decision {
  decisions.unshift(decision);
  return decision;
}

export function updateDecision(
  id: string,
  updates: Partial<Decision>,
): Decision | undefined {
  const decision = decisions.find((item) => item.id === id);

  if (!decision) {
    return undefined;
  }

  Object.assign(decision, updates);

  return decision;
}

export function getCrossThemes(): CrossTheme[] {
  return crossThemes;
}

export function getTrend(): TrendPoint[] {
  return trend;
}

export function getMetrics(): Metrics {
  const totalFeedback = feedback.length;

  const negativeFeedback = feedback.filter(
    (item) => item.sentiment === "negative",
  ).length;

  const highPriorityIssues = issues.filter(
    (item) =>
      item.priorityLevel === "high" ||
      item.priorityLevel === "critical",
  ).length;

  return {
    totalFeedback,
    negativeFeedback,
    detectedIssues: issues.length,
    highPriorityIssues,
    totalDelta: 8.2,
    negativeDelta: 3.1,
    newIssues: 3,
    highPriorityDelta: 5,
  };
}