import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  tone?: "default" | "good" | "warn" | "bad";
};

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-white border-slate-200",
  good: "bg-emerald-50 border-emerald-200",
  warn: "bg-amber-50 border-amber-200",
  bad: "bg-red-50 border-red-200",
};

export function StatCard({ label, value, helper, tone = "default" }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-4 ${TONES[tone]}`}>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-1">{value}</div>
      {helper ? <div className="text-xs text-slate-500 mt-1">{helper}</div> : null}
    </div>
  );
}
