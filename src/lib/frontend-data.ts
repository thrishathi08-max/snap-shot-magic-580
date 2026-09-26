import {
  getDecisions,
  getFeedback,
  getFeedbackForIssue,
  getIssue,
  getIssues,
} from "@/lib/api";

import {
  feedback as localFeedback,
} from "@/lib/mock-data";

import type {
  Decision,
  Feedback,
  IndustryFilter,
  Issue,
} from "@/lib/types";

export type DecisionStatus =
  | "Proposed"
  | "Under Review"
  | "Accepted"
  | "In Progress"
  | "Completed";

const decisionStatuses: Record<
  string,
  DecisionStatus
> = {
  "d-1": "Proposed",
  "d-2": "Under Review",
  "d-3": "Accepted",
  "d-4": "In Progress",
  "d-5": "Proposed",
  "d-6": "Completed",
  "d-7": "Under Review",
  "d-8": "Proposed",
};

const currentStatuses =
  new Map<
    string,
    DecisionStatus
  >();

export function getDecisionStatus(
  id: string,
): DecisionStatus {
  return (
    currentStatuses.get(id) ??
    decisionStatuses[id] ??
    "Proposed"
  );
}

export function setDecisionStatus(
  id: string,
  status: DecisionStatus,
) {
  currentStatuses.set(
    id,
    status,
  );
}

/* -------------------------------------------------------------------------- */
/* Decisions                                                                  */
/* -------------------------------------------------------------------------- */

export function getDecision(
  id: string,
): Decision | undefined {
  return getDecisions().find(
    (decision) =>
      decision.id === id,
  );
}

export function getRelatedDecision(
  issueId: string,
): Decision | undefined {
  return getDecisions().find(
    (decision) =>
      decision.relatedIssueId ===
      issueId,
  );
}

/* -------------------------------------------------------------------------- */
/* Feedback                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * These helper functions are intentionally synchronous for now.
 *
 * Feedback Explorer itself uses the FastAPI-backed async getFeedback().
 * The navbar, issue details and search helpers still use the local
 * feedback dataset so they don't break the existing synchronous UI.
 */

export function getFeedbackDetails(
  id: string,
): Feedback | undefined {
  return localFeedback.find(
    (item) => item.id === id,
  );
}

export function getIssueFeedback(
  issueId: string,
  limit = 6,
): Feedback[] {
  return getFeedbackForIssue(
    issueId,
    limit,
  );
}

export function getIssueById(
  id: string,
): Issue | undefined {
  return getIssue(id);
}

/* -------------------------------------------------------------------------- */
/* Search                                                                     */
/* -------------------------------------------------------------------------- */

export function searchIssues(
  query: string,
) {
  const term =
    query.trim().toLowerCase();

  return getIssues().filter(
    (issue) =>
      !term ||
      `${issue.name} ${issue.theme} ${issue.industry}`
        .toLowerCase()
        .includes(term),
  );
}

/**
 * Navbar search remains synchronous.
 *
 * This deliberately searches the local dataset instead of calling the
 * async FastAPI-backed getFeedback(), because TopBar renders synchronously.
 */
export function searchFeedback(
  query: string,
): Feedback[] {
  const term =
    query.trim().toLowerCase();

  return localFeedback.filter(
    (item) =>
      !term ||
      `${item.text} ${item.source}`
        .toLowerCase()
        .includes(term),
  );
}

export function searchDecisions(
  query: string,
) {
  const term =
    query.trim().toLowerCase();

  return getDecisions().filter(
    (decision) => {
      const issue =
        getIssue(
          decision.relatedIssueId,
        );

      return (
        !term ||
        `${decision.problem} ${decision.recommendedAction} ${
          issue?.name ?? ""
        }`
          .toLowerCase()
          .includes(term)
      );
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

export function getIssueForFeedback(
  item: Feedback,
): Issue | undefined {
  const issueId =
    item.issueIds[0];

  return issueId
    ? getIssue(issueId)
    : undefined;
}

export function getIndustryLabel(
  industry:
    | IndustryFilter
    | "ecommerce"
    | "restaurant",
) {
  if (industry === "all") {
    return "All domains";
  }

  if (
    industry ===
    "ecommerce"
  ) {
    return "E-Commerce";
  }

  return "Restaurant";
}

export function getTheme(
  item: Feedback,
) {
  return (
    getIssueForFeedback(item)
      ?.theme ??
    "General experience"
  );
}

export function getDecisionPriority(
  decision: Decision,
): Issue["priorityLevel"] {
  return (
    getIssue(
      decision.relatedIssueId,
    )?.priorityLevel ??
    "medium"
  );
}