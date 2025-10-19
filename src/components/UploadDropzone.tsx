"use client";
import React, { useCallback } from "react";

type Props = {
    multiple?: boolean;
    accept?: string;
    onFiles: (files: File[]) => void;
};

export default function UploadDropzone({
    multiple = true,
    accept = "image/*",
    onFiles,
}: Props) {
    const handleFiles = useCallback(
        (fileList: FileList | null) => {
            if (!fileList) return;
            const arr = Array.from(fileList);
            onFiles(arr);
        },
        [onFiles]
    );

    const onDrop: React.DragEventHandler<HTMLDivElement> = useCallback(
        (e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
        },
        [handleFiles]
    );

    const onInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
        (e) => {
            handleFiles(e.target.files);
            // clear so same file can be re-selected
            e.currentTarget.value = "";
        },
        [handleFiles]
    );

    return (
        <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="w-full rounded-lg border-2 border-dashed border-border p-6 text-center transition focus-within:ring-2 focus-within:ring-ring"
        >
            <input
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={onInputChange}
                className="sr-only"
                id="file-input"
                aria-label="Drag & drop images here or click to select"
            />
            <label htmlFor="file-input" className="cursor-pointer select-none">
                <div className="mx-auto max-w-xl">
                    <p className="text-lg font-semibold text-slate-800">
                        Drag & drop images here or click to select
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        Supported formats: PNG, JPEG, WEBP, AVIF, TIFF, SVG and more
                    </p>
                </div>
            </label>
        </div>
    );
}
