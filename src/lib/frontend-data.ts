import { getDecisions, getFeedback, getFeedbackForIssue, getIssue, getIssues } from "@/lib/api";
import type { Decision, Feedback, IndustryFilter, Issue } from "@/lib/types";

export type DecisionStatus = "Proposed" | "Under Review" | "Accepted" | "In Progress" | "Completed";
const decisionStatuses: Record<string, DecisionStatus> = {
  "d-1": "Proposed", "d-2": "Under Review", "d-3": "Accepted", "d-4": "In Progress",
  "d-5": "Proposed", "d-6": "Completed", "d-7": "Under Review", "d-8": "Proposed",
};
const currentStatuses = new Map<string, DecisionStatus>();

export function getDecisionStatus(id: string): DecisionStatus {
  return currentStatuses.get(id) ?? decisionStatuses[id] ?? "Proposed";
}
export function setDecisionStatus(id: string, status: DecisionStatus) {
  currentStatuses.set(id, status);
}
export function getDecision(id: string): Decision | undefined {
  return getDecisions().find((decision) => decision.id === id);
}
export function getRelatedDecision(issueId: string): Decision | undefined {
  return getDecisions().find((decision) => decision.relatedIssueId === issueId);
}
export function getFeedbackDetails(id: string): Feedback | undefined {
  return getFeedback({ days: 90 }).find((item) => item.id === id);
}
export function getIssueFeedback(issueId: string, limit = 6): Feedback[] {
  return getFeedbackForIssue(issueId, limit);
}
export function getIssueById(id: string): Issue | undefined {
  return getIssue(id);
}
export function searchIssues(query: string) {
  const term = query.trim().toLowerCase();
  return getIssues().filter((issue) => !term || `${issue.name} ${issue.theme} ${issue.industry}`.toLowerCase().includes(term));
}
export function searchFeedback(query: string) {
  const term = query.trim().toLowerCase();
  return getFeedback({ days: 90 }).filter((item) => !term || `${item.text} ${item.source}`.toLowerCase().includes(term));
}
export function searchDecisions(query: string) {
  const term = query.trim().toLowerCase();
  return getDecisions().filter((decision) => {
    const issue = getIssue(decision.relatedIssueId);
    return !term || `${decision.problem} ${decision.recommendedAction} ${issue?.name ?? ""}`.toLowerCase().includes(term);
  });
}
export function getIssueForFeedback(item: Feedback): Issue | undefined {
  const issueId = item.issueIds[0];
  return issueId ? getIssue(issueId) : undefined;
}
export function getIndustryLabel(industry: IndustryFilter | "ecommerce" | "restaurant") {
  return industry === "all" ? "All domains" : industry === "ecommerce" ? "E-Commerce" : "Restaurant";
}
export function getTheme(item: Feedback) {
  return getIssueForFeedback(item)?.theme ?? "General experience";
}
export function getDecisionPriority(decision: Decision): Issue["priorityLevel"] {
  return getIssue(decision.relatedIssueId)?.priorityLevel ?? "medium";
}
