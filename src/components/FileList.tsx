"use client";
import React from "react";
import { Button } from "./ui/button";

type Item = {
    id: string;
    file: File;
};

type Props = {
    items: Item[];
    onRemove: (id: string) => void;
};

export default function FileList({ items, onRemove }: Props) {
    return (
        <div className="mt-4">
            {items.length === 0 ? (
                <p className="text-sm text-slate-500">No files selected.</p>
            ) : (
                <ul className="space-y-2">
                    {items.map((it) => (
                        <li
                            key={it.id}
                            className="flex items-center justify-between rounded-md border p-2"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 flex-none overflow-hidden rounded bg-card">
                                    {it.file.type.startsWith("image/") ? (
                                        typeof URL !== "undefined" && typeof URL.createObjectURL === "function" ? (
                                            <div className="h-full w-full">
                                                <img
                                                    src={URL.createObjectURL(it.file)}
                                                    alt={it.file.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                                                Preview
                                            </div>
                                        )
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-sm text-muted">
                                            File
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <div className="truncate font-medium text-slate-800">
                                        {it.file.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {(it.file.size / 1024).toFixed(1)} KB • {it.file.type || "n/a"}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => onRemove(it.id)}
                                >
                                    Remove
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
