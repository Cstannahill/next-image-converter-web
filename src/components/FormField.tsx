"use client";
import React from "react";
import { Label } from "./ui/label";

type Props = {
    label?: React.ReactNode;
    help?: React.ReactNode;
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
};

export default function FormField({ label, help, htmlFor, children, className }: Props) {
    return (
        <div className={`flex flex-col ${className ?? ""}`}>
            {label ? (
                <Label htmlFor={htmlFor} className="mb-1">
                    {label}
                </Label>
            ) : null}
            <div>{children}</div>
            {help ? <p className="mt-1 text-xs text-slate-500">{help}</p> : null}
        </div>
    );
}
