import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { SentimentBar } from "@/components/charts";
import {
  EmptyState,
  ImpactTag,
  INDUSTRY_OPTIONS,
  IndustryTag,
  PageHeading,
  Panel,
  PanelHeader,
  PriorityBadge,
  Segmented,
  SentimentTag,
  formatDate,
  formatNumber,
} from "@/components/ui-kit";
import { getDecisions, getIssue } from "@/lib/api";
import {
  getDecisionStatus,
  setDecisionStatus,
  getDecisionPriority,
  getIssueFeedback,
  type DecisionStatus,
} from "@/lib/frontend-data";
import type { Decision, IndustryFilter } from "@/lib/types";

export const Route = createFileRoute("/product-decisions")({
  head: () => ({
    meta: [
      { title: "Product Decisions — InsightFlow" },
      {
        name: "description",
        content:
          "See how customer feedback and detected issues translate into concrete product decisions.",
      },
      { property: "og:title", content: "Product Decisions — InsightFlow" },
      {
        property: "og:description",
        content:
          "Evidence-based product decisions with traceable links back to customer feedback.",
      },
    ],
  }),
  component: ProductDecisionsPage,
});

type StatusFilter = "all" | DecisionStatus;

const STATUS_OPTIONS: readonly { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "Proposed", label: "Proposed" },
  { value: "Under Review", label: "Under Review" },
  { value: "Accepted", label: "Accepted" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
];

const DECISION_STATUS_STYLES: Record<DecisionStatus, string> = {
  Proposed: "bg-muted text-muted-foreground ring-border",
  "Under Review": "bg-medium-soft text-medium ring-medium/20",
  Accepted: "bg-brand/10 text-brand ring-brand/20",
  "In Progress": "bg-high-soft text-high ring-high/20",
  Completed: "bg-low-soft text-positive ring-low/20",
};

function DecisionStatusBadge({ status }: { status: DecisionStatus }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 font-mono text-[11px] ring-1 ${DECISION_STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

// Owner data keyed by decision ID for mockery
const OWNERS: Record<string, { name: string; initials: string }> = {
  "d-1": { name: "Ava Reyes", initials: "AR" },
  "d-2": { name: "Marcus Chen", initials: "MC" },
  "d-3": { name: "Sofia Patel", initials: "SP" },
  "d-4": { name: "Jonas Berg", initials: "JB" },
  "d-5": { name: "Lina Torres", initials: "LT" },
  "d-6": { name: "Ava Reyes", initials: "AR" },
  "d-7": { name: "Marcus Chen", initials: "MC" },
  "d-8": { name: "Sofia Patel", initials: "SP" },
};

const DATES: Record<string, string> = {
  "d-1": "2026-09-22",
  "d-2": "2026-09-20",
  "d-3": "2026-09-19",
  "d-4": "2026-09-18",
  "d-5": "2026-09-24",
  "d-6": "2026-09-25",
  "d-7": "2026-09-16",
  "d-8": "2026-09-15",
};

function DecisionDetail({
  decision,
  onClose,
}: {
  decision: Decision;
  onClose: () => void;
}) {
  const issue = getIssue(decision.relatedIssueId);
  const status = getDecisionStatus(decision.id);
  const [localStatus, setLocalStatus] = useState<DecisionStatus>(status);
  const feedback = getIssueFeedback(decision.relatedIssueId, 3);
  const owner = OWNERS[decision.id] ?? { name: "Unassigned", initials: "—" };
  const date = DATES[decision.id] ?? "2026-09-20";

  function updateStatus(next: DecisionStatus) {
    setLocalStatus(next);
    setDecisionStatus(decision.id, next);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/30 p-4 pt-12 backdrop-blur-sm sm:pt-16"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-panel w-full max-w-2xl p-0 rise-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <DecisionStatusBadge status={localStatus} />
              <ImpactTag
                impact={decision.impact}
                note={decision.impactNote}
              />
            </div>
            <h2 className="mt-3 font-display text-xl font-semibold text-pretty">
              {decision.recommendedAction}
            </h2>
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
          {/* Problem */}
          <div>
            <p className="label-mono">Why proposed</p>
            <p className="mt-2 text-sm leading-relaxed text-pretty">
              {decision.problem}
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="glass-inset p-3">
              <p className="label-mono">Signals</p>
              <p className="mt-1 font-display text-lg font-semibold">
                {formatNumber(decision.affectedFeedback)}
              </p>
            </div>
            <div className="glass-inset p-3">
              <p className="label-mono">Impact</p>
              <p className="mt-1 text-sm font-medium capitalize">
                {decision.impact}
              </p>
            </div>
            <div className="glass-inset p-3">
              <p className="label-mono">Owner</p>
              <p className="mt-1 text-sm font-medium">{owner.name}</p>
            </div>
            <div className="glass-inset p-3">
              <p className="label-mono">Created</p>
              <p className="mt-1 text-sm font-medium">{formatDate(date)}</p>
            </div>
          </div>

          {/* Related issue */}
          {issue ? (
            <div className="glass-inset p-4">
              <p className="label-mono">Related issue</p>
              <div className="mt-2 flex items-center gap-3">
                <PriorityBadge level={issue.priorityLevel} />
                <div>
                  <p className="text-sm font-medium">{issue.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {issue.industry === "ecommerce"
                      ? "E-Commerce"
                      : "Restaurant"}{" "}
                    · {issue.mentions} mentions
                  </p>
                </div>
              </div>
              {issue.sentiment ? (
                <div className="mt-3">
                  <SentimentBar split={issue.sentiment} />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Evidence */}
          <div>
            <p className="label-mono">Evidence</p>
            <ul className="mt-2 space-y-1.5">
              {decision.evidence.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Expected impact */}
          <div className="glass-inset p-4">
            <p className="label-mono">Expected impact</p>
            <p className="mt-2 text-sm font-medium">{decision.impactNote}</p>
          </div>

          {/* Supporting feedback */}
          {feedback.length > 0 ? (
            <div>
              <p className="label-mono">Supporting feedback</p>
              <div className="mt-2 space-y-2">
                {feedback.map((item) => (
                  <div key={item.id} className="glass-inset p-3">
                    <p className="text-sm text-pretty">{item.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <SentimentTag sentiment={item.sentiment} />
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {item.rating}/5
                      </span>
                      <span className="font-mono text-[11px] text-faint">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Status update */}
          <div>
            <p className="label-mono">Update status</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(
                [
                  "Proposed",
                  "Under Review",
                  "Accepted",
                  "In Progress",
                  "Completed",
                ] as const
              ).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateStatus(s)}
                  className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    localStatus === s
                      ? "bg-brand text-brand-foreground"
                      : "border border-border bg-glass-strong text-muted-foreground hover:bg-card"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
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

function ProductDecisionsPage() {
  const [industry, setIndustry] = useState<IndustryFilter>("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(
    null,
  );

  const decisions = useMemo(() => {
    const needle = search.trim().toLowerCase();
    let list = getDecisions(industry);

    if (statusFilter !== "all") {
      list = list.filter((d) => getDecisionStatus(d.id) === statusFilter);
    }
    if (needle) {
      list = list.filter((d) => {
        const issue = getIssue(d.relatedIssueId);
        return `${d.problem} ${d.recommendedAction} ${issue?.name ?? ""}`
          .toLowerCase()
          .includes(needle);
      });
    }

    return list;
  }, [industry, search, statusFilter]);

  return (
    <AppShell breadcrumb="Product Decisions">
      <PageHeading
        title="Product Decisions"
        subtitle="Evidence-based decisions derived from aggregated feedback and detected issues."
      >
        <Segmented
          label="Domain"
          options={INDUSTRY_OPTIONS}
          value={industry}
          onChange={setIndustry}
        />
      </PageHeading>

      {/* Filters */}
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions…"
            className="w-full rounded-lg border border-border bg-glass-strong py-2.5 pr-3 pl-9 text-sm placeholder:text-faint focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <div className="mt-4">
          <label className="flex flex-col gap-1 sm:max-w-xs">
            <span className="label-mono">Status</span>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="rounded-lg border border-border bg-glass-strong px-3 py-2 text-sm focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {/* Decision cards */}
      <Panel className="mt-4">
        <div className="border-b border-border px-5 py-4">
          <PanelHeader
            title="Decisions"
            subtitle={`${formatNumber(decisions.length)} ${decisions.length === 1 ? "decision" : "decisions"} matching filters`}
          />
        </div>

        {decisions.length === 0 ? (
          <EmptyState message="No decisions match these filters." />
        ) : (
          <div className="divide-y divide-border">
            {decisions.map((decision) => {
              const issue = getIssue(decision.relatedIssueId);
              const status = getDecisionStatus(decision.id);
              const owner = OWNERS[decision.id] ?? {
                name: "Unassigned",
                initials: "—",
              };
              const date = DATES[decision.id] ?? "2026-09-20";
              const priority = getDecisionPriority(decision);

              return (
                <button
                  key={decision.id}
                  type="button"
                  onClick={() => setSelectedDecision(decision)}
                  className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-ink/[0.025]"
                >
                  <span className="mt-0.5 shrink-0">
                    <PriorityBadge level={priority} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-pretty">
                      {decision.recommendedAction}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {issue?.name ?? "General"} ·{" "}
                      {formatNumber(decision.affectedFeedback)} signals ·{" "}
                      {owner.name}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <DecisionStatusBadge status={status} />
                      <ImpactTag impact={decision.impact} />
                      {issue ? (
                        <IndustryTag industry={issue.industry} />
                      ) : null}
                      <span className="font-mono text-[11px] text-faint">
                        {formatDate(date)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Panel>

      {selectedDecision ? (
        <DecisionDetail
          decision={selectedDecision}
          onClose={() => setSelectedDecision(null)}
        />
      ) : null}
    </AppShell>
  );
}
