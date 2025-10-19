"use client";
import React from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";

type Result =
    | { type: "single"; fileName: string; blob: Blob }
    | { type: "zip"; fileName: string; blob: Blob };

type Props = {
    result?: Result | null;
};

export default function ResultDownload({ result }: Props) {
    if (!result) return null;

    const download = () => {
        const url = typeof URL !== "undefined" && typeof URL.createObjectURL === "function" ? URL.createObjectURL(result.blob) : null;
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 500);
        toast.success("Download started");
    };

    const isImage = result.fileName.match(/\.(png|jpe?g|webp|avif|tiff?|bmp|svg)$/i);

    return (
        <div className="mt-4 rounded border p-4">
            <div className="flex items-start gap-4">
                <div className="flex-1">
                    <div className="text-sm text-slate-600">Result</div>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="min-w-0">
                            <div className="truncate font-medium text-slate-800">{result.fileName}</div>
                            <div className="text-xs text-slate-500">{(result.blob.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <div>
                            <Button onClick={download}>
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
                {isImage ? (
                    <div className="w-28 flex-none overflow-hidden rounded bg-card">
                        {typeof URL !== "undefined" && typeof URL.createObjectURL === "function" ? (
                            <img
                                src={URL.createObjectURL(result.blob)}
                                alt={result.fileName}
                                className="h-full w-full object-contain"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-muted">Preview</div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
