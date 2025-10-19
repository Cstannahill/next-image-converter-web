"use client";
import React from "react";

type Props = {
    value: number; // 0-100
    label?: string;
};

export default function ProgressBar({ value, label }: Props) {
    const pct = Math.max(0, Math.min(100, Math.round(value)));
    return (
        <div className="w-full">
            {label && <div className="mb-1 text-sm text-slate-600">{label}</div>}
            <div className="h-3 w-full rounded bg-slate-200">
                <div
                    className="h-3 rounded bg-emerald-500 transition-all"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <div className="mt-1 text-xs text-slate-500">{pct}%</div>
        </div>
    );
}
