import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  PageHeading,
  Panel,
  PanelHeader,
  Segmented,
  formatNumber,
} from "@/components/ui-kit";
import { PIPELINE_STAGES, analyzeUpload, type AnalyzeResult } from "@/lib/api";
import type { Industry } from "@/lib/types";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Feedback — InsightFlow" },
      {
        name: "description",
        content:
          "Upload a CSV of customer feedback, pick the industry, and run the InsightFlow analysis pipeline.",
      },
      { property: "og:title", content: "Upload Feedback — InsightFlow" },
      {
        property: "og:description",
        content:
          "Drop in a feedback CSV and watch sentiment, clustering and priority scoring run end to end.",
      },
    ],
  }),
  component: UploadPage,
});

const INDUSTRY_OPTIONS = [
  { value: "ecommerce" as Industry, label: "E-Commerce" },
  { value: "restaurant" as Industry, label: "Restaurant" },
];

type Status = "idle" | "processing" | "done";

function UploadPage() {
  const [industry, setIndustry] = useState<Industry>("ecommerce");
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  function pick(files: FileList | null) {
    const next = files?.[0];
    if (!next) return;
    setFile(next);
    setStatus("idle");
    setResult(null);
  }

  async function runAnalysis() {
    if (!file) return;
    setStatus("processing");
    setStage(0);
    timers.current.forEach(clearTimeout);
    timers.current = PIPELINE_STAGES.map((_, index) =>
      setTimeout(() => setStage(index), index * 330),
    );
    const analysis = await analyzeUpload(file.name, industry);
    timers.current.forEach(clearTimeout);
    setResult(analysis);
    setStatus("done");
  }

  function reset() {
    setFile(null);
    setResult(null);
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <AppShell breadcrumb="Upload Feedback">
      <PageHeading
        title="Upload Feedback"
        subtitle="Bring in a CSV export and the pipeline will classify, cluster and score it."
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <PanelHeader
            title="Feedback file"
            subtitle="CSV with one row per feedback entry"
          />

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              pick(event.dataTransfer.files);
            }}
            className={`mt-4 rounded-xl border border-dashed px-6 py-12 text-center transition-colors ${
              dragging
                ? "border-brand bg-brand/5"
                : "border-input bg-glass-strong"
            }`}
          >
            <p className="font-display text-base font-semibold">
              Drop your CSV here
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Columns: feedback_text, rating, date
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => pick(event.target.files)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-5 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Browse files
            </button>
          </div>

          {file ? (
            <div className="glass-inset mt-4 flex items-center gap-3 p-3">
              <span className="grid size-9 place-items-center rounded-md bg-brand/10 font-mono text-[10px] font-medium text-brand">
                CSV
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB · ready to analyse
                </p>
              </div>
              <button
                type="button"
                onClick={reset}
                className="rounded-md px-2 py-1 font-mono text-[11px] text-muted-foreground hover:bg-ink/5"
              >
                Remove
              </button>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Segmented
              label="Industry"
              options={INDUSTRY_OPTIONS}
              value={industry}
              onChange={setIndustry}
            />
            <button
              type="button"
              disabled={!file || status === "processing"}
              onClick={runAnalysis}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {status === "processing" ? "Analysing…" : "Analyze Feedback"}
            </button>
          </div>
        </Panel>

        <Panel className="p-5">
          <PanelHeader title="Pipeline" subtitle="Seven stages, in order" />
          <ol className="mt-4 space-y-3">
            {PIPELINE_STAGES.map((name, index) => {
              const state =
                status === "done" || (status === "processing" && index < stage)
                  ? "done"
                  : status === "processing" && index === stage
                    ? "active"
                    : "idle";
              return (
                <li key={name} className="flex items-center gap-3 text-sm">
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-[10px] ${
                      state === "done"
                        ? "bg-low-soft text-positive"
                        : state === "active"
                          ? "animate-pulse bg-brand text-brand-foreground"
                          : "bg-muted text-faint"
                    }`}
                  >
                    {state === "done" ? "✓" : index + 1}
                  </span>
                  <span
                    className={
                      state === "idle" ? "text-muted-foreground" : "font-medium"
                    }
                  >
                    {name}
                  </span>
                </li>
              );
            })}
          </ol>
        </Panel>
      </div>

      {status === "done" && result ? (
        <Panel className="mt-4 p-5">
          <PanelHeader
            title="Analysis complete"
            subtitle={`${industry === "ecommerce" ? "E-Commerce" : "Restaurant"} feedback processed`}
            action={
              <Link
                to="/issues"
                className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                Review detected issues
              </Link>
            }
          />
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="glass-inset p-4">
              <p className="label-mono">Rows processed</p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {formatNumber(result.rowsProcessed)}
              </p>
            </div>
            <div className="glass-inset p-4">
              <p className="label-mono">Negative share</p>
              <p className="mt-2 font-display text-2xl font-semibold text-critical">
                {result.negativeShare}%
              </p>
            </div>
            <div className="glass-inset p-4">
              <p className="label-mono">New issues</p>
              <p className="mt-2 font-display text-2xl font-semibold">
                {result.newIssues}
              </p>
            </div>
            <div className="glass-inset p-4">
              <p className="label-mono">Top cluster</p>
              <p className="mt-2 text-sm font-medium">{result.topIssue}</p>
            </div>
          </div>
        </Panel>
      ) : null}
    </AppShell>
  );
}
