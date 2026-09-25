import { useId } from "react";
import type { SentimentSplit, TrendPoint } from "@/lib/types";
import { formatDate } from "./ui-kit";

const W = 720;
const H = 220;

function toPath(values: number[], min: number, max: number): string {
  if (values.length === 0) return "";
  const span = Math.max(max - min, 1);
  const step = values.length > 1 ? W / (values.length - 1) : W;
  return values
    .map((value, index) => {
      const x = index * step;
      const y = H - 20 - ((value - min) / span) * (H - 45);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Net sentiment over time: positive as a filled line, negative as a dashed one. */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  const gradientId = useId();
  const all = points.flatMap((p) => [p.positive, p.negative]);
  const min = Math.min(...all) - 6;
  const max = Math.max(...all) + 6;
  const positivePath = toPath(
    points.map((p) => p.positive),
    min,
    max,
  );
  const negativePath = toPath(
    points.map((p) => p.negative),
    min,
    max,
  );
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const index = Math.min(
      points.length - 1,
      Math.round(ratio * (points.length - 1)),
    );
    return points[index]?.date;
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Sentiment trend over the selected period"
      >
        <g className="text-ink" stroke="currentColor" strokeOpacity="0.06">
          {[40, 90, 140, 190].map((y) => (
            <line key={y} x1="0" y1={y} x2={W} y2={y} />
          ))}
        </g>
        <path
          d={`${positivePath} L${W},${H} L0,${H} Z`}
          fill={`url(#${gradientId})`}
        />
        <path
          className="chart-line text-brand"
          d={positivePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          className="text-critical"
          d={negativePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="currentColor"
              stopOpacity="0.18"
              className="text-brand"
            />
            <stop
              offset="100%"
              stopColor="currentColor"
              stopOpacity="0"
              className="text-brand"
            />
          </linearGradient>
        </defs>
      </svg>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-faint">
        {ticks.map((date, index) => (
          <span key={`${date}-${index}`}>
            {date ? formatDate(date).slice(0, 6) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ChartLegend() {
  return (
    <div className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-brand" />
        Positive
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-critical" />
        Negative
      </span>
    </div>
  );
}

/** Mention volume for a single issue cluster over the last 14 periods. */
export function IssueTrendChart({ values }: { values: number[] }) {
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const path = toPath(values, min, max);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Mentions trend for this issue"
    >
      <g className="text-ink" stroke="currentColor" strokeOpacity="0.06">
        {[55, 110, 165].map((y) => (
          <line key={y} x1="0" y1={y} x2={W} y2={y} />
        ))}
      </g>
      <path
        className="chart-line text-brand"
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sparkline({ values }: { values: number[] }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 1);
  const path = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 26 - ((value - min) / span) * 22;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 30"
      className="h-7 w-20 text-brand"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SentimentBar({ split }: { split: SentimentSplit }) {
  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="bg-positive" style={{ width: `${split.positive}%` }} />
        <div className="bg-neutral" style={{ width: `${split.neutral}%` }} />
        <div className="bg-critical" style={{ width: `${split.negative}%` }} />
      </div>
      <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>{split.positive}% positive</span>
        <span>{split.neutral}% neutral</span>
        <span className="text-critical">{split.negative}% negative</span>
      </div>
    </div>
  );
}

/** Side-by-side domain comparison for a shared theme. */
export function CompareBars({
  ecommerce,
  restaurant,
  max,
}: {
  ecommerce: number;
  restaurant: number;
  max: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className="w-24 shrink-0 font-mono text-[11px] text-muted-foreground">
          E-Commerce
        </span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand"
            style={{ width: `${(ecommerce / max) * 100}%` }}
          />
        </div>
        <span className="w-10 text-right font-mono text-xs">{ecommerce}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 shrink-0 font-mono text-[11px] text-muted-foreground">
          Restaurant
        </span>
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-high"
            style={{ width: `${(restaurant / max) * 100}%` }}
          />
        </div>
        <span className="w-10 text-right font-mono text-xs">{restaurant}</span>
      </div>
    </div>
  );
}
