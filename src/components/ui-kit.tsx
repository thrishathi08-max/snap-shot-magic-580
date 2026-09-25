import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type {
  Impact,
  IndustryFilter,
  PriorityLevel,
  Sentiment,
} from "@/lib/types";
import { DATE_RANGES, type DateRange } from "@/lib/api";

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("glass-panel", className)}>{children}</div>;
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-balance sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-pretty text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  tone = "neutral",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "positive" | "negative" | "warn" | "neutral";
}) {
  return (
    <Panel className="p-4 transition-shadow hover:shadow-lg hover:shadow-ink/5">
      <p className="label-mono">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
        {value}
      </p>
      <p
        className={cn(
          "mt-1 text-xs",
          tone === "positive" && "text-positive",
          tone === "negative" && "text-critical",
          tone === "warn" && "text-high",
          tone === "neutral" && "text-muted-foreground",
        )}
      >
        {delta}
      </p>
    </Panel>
  );
}

const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  critical: "bg-critical-soft text-critical ring-critical/20",
  high: "bg-high-soft text-high ring-high/20",
  medium: "bg-medium-soft text-medium ring-medium/20",
  low: "bg-low-soft text-low ring-low/20",
};

const PRIORITY_RAIL: Record<PriorityLevel, string> = {
  critical: "bg-critical",
  high: "bg-high",
  medium: "bg-medium",
  low: "bg-low",
};

const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 font-mono text-[11px] font-medium ring-1",
        PRIORITY_STYLES[level],
      )}
    >
      {PRIORITY_LABEL[level]}
    </span>
  );
}

export function PriorityScore({
  level,
  score,
  size = "sm",
}: {
  level: PriorityLevel;
  score: number;
  size?: "sm" | "lg";
}) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-lg font-mono font-semibold",
        PRIORITY_STYLES[level],
        size === "sm" ? "size-9 text-sm" : "size-16 text-2xl",
      )}
    >
      {score}
    </span>
  );
}

export function PriorityRail({ level }: { level: PriorityLevel }) {
  return (
    <span
      className={cn(
        "h-10 w-1 shrink-0 rounded-full",
        PRIORITY_RAIL[level],
      )}
    />
  );
}

export function SentimentTag({ sentiment }: { sentiment: Sentiment }) {
  const styles: Record<Sentiment, string> = {
    positive: "bg-low-soft text-positive ring-low/20",
    neutral: "bg-muted text-muted-foreground ring-border",
    negative: "bg-critical-soft text-critical ring-critical/20",
  };
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 font-mono text-[11px] capitalize ring-1",
        styles[sentiment],
      )}
    >
      {sentiment}
    </span>
  );
}

export function ImpactTag({
  impact,
  note,
}: {
  impact: Impact;
  note?: string;
}) {
  const styles: Record<Impact, string> = {
    high: "bg-brand/10 text-brand ring-brand/20",
    medium: "bg-medium-soft text-medium ring-medium/20",
    low: "bg-muted text-muted-foreground ring-border",
  };
  return (
    <span
      className={cn(
        "rounded-md px-2 py-1 font-mono text-[11px] ring-1",
        styles[impact],
      )}
    >
      {impact} impact{note ? ` · ${note}` : ""}
    </span>
  );
}

export function IndustryTag({ industry }: { industry: "ecommerce" | "restaurant" }) {
  return (
    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-border">
      {industry === "ecommerce" ? "E-Commerce" : "Restaurant"}
    </span>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded-lg border border-border bg-glass-strong p-0.5 text-sm"
    >
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={option.value === value}
          className={cn(
            "rounded-md px-3 py-1.5 transition-colors",
            option.value === value
              ? "bg-ink font-medium text-primary-foreground"
              : "text-muted-foreground hover:bg-ink/5",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export const INDUSTRY_OPTIONS: readonly { value: IndustryFilter; label: string }[] =
  [
    { value: "all", label: "All" },
    { value: "ecommerce", label: "E-Commerce" },
    { value: "restaurant", label: "Restaurant" },
  ];

export function DateRangeSelect({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (value: DateRange) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-glass-strong px-3 py-2 text-sm text-muted-foreground">
      <span className="sr-only">Date range</span>
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value) as DateRange)}
        className="bg-transparent font-mono text-xs text-ink focus:outline-none"
      >
        {DATE_RANGES.map((range) => (
          <option key={range.value} value={range.value}>
            {range.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label-mono">{label}</span>
      <select
        value={String(value)}
        onChange={(event) => {
          const next = options.find(
            (option) => String(option.value) === event.target.value,
          );
          if (next) onChange(next.value);
        }}
        className="rounded-lg border border-border bg-glass-strong px-3 py-2 text-sm focus:border-brand/40 focus:ring-2 focus:ring-ring focus:outline-none"
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-GB");
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatTrend(value: number): string {
  return `${value > 0 ? "▲" : value < 0 ? "▼" : "•"} ${Math.abs(value)}%`;
}
