"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
  UploadDropzone,
  FileList,
  ResultDownload,
  FormField,
  Header,
} from "../components";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import {
  Field,
  FieldGroup,
  FieldSet,
  FieldLegend,
  FieldSeparator,
  FieldLabel,
  FieldDescription,
} from "../components/ui/field";
import { Spinner } from "../components/ui/spinner";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { uploadFormDataWithProgress } from "../lib/upload";
import {
  ImageManipulationApiClient,
  createApiHooks,
} from "../lib/api";
import { ImageFormat } from "../lib/api/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export default function HomePage() {
  const client = useMemo(() => new ImageManipulationApiClient({ baseUrl: API_BASE }), []);
  const api = useMemo(() => createApiHooks(client), [client]);

  const convertMutation = api.useConvertImageConvertPostMutation();
  const batchMutation = api.useBatchConvertImagesConvertBatchPostMutation();

  const [files, setFiles] = useState<{ id: string; file: File }[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>(ImageFormat.PNG);
  const [quality, setQuality] = useState<number | undefined>(undefined);
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [dpi, setDpi] = useState<number | undefined>(undefined);
  const [scale, setScale] = useState<number | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState<string | null>(null);

  const onFiles = (incoming: File[]) => {
    const mapped = incoming.map((f) => ({ id: (crypto as any)?.randomUUID?.() ?? String(Date.now()), file: f }));
    setFiles((s) => [...s, ...mapped]);
  };

  // determine UI enablement rules
  const lossyFormats = useMemo(
    () => new Set([ImageFormat.JPEG, ImageFormat.JPG, ImageFormat.WEBP, ImageFormat.AVIF, ImageFormat.HEIC, ImageFormat.HEIF]),
    []
  );
  const isLossy = lossyFormats.has(targetFormat);
  const isSvg = targetFormat === ImageFormat.SVG;

  // Clear inputs that are not applicable when target format changes
  useEffect(() => {
    if (!isLossy) setQuality(undefined);
    if (!isSvg) {
      setDpi(undefined);
      setScale(undefined);
    }
  }, [isLossy, isSvg]);

  const removeFile = (id: string) => setFiles((s) => s.filter((x) => x.id !== id));

  const resetResult = () => {
    setResultBlob(null);
    setResultName(null);
  };

  const submit = async () => {
    if (files.length === 0) return;
    resetResult();
    setProgress(10);
    setIsProcessing(true);
    const fd = new FormData();
    if (files.length === 1) fd.append("file", files[0].file);
    else files.forEach((f) => fd.append("files", f.file));
    fd.append("target_format", targetFormat);
    if (quality) fd.append("quality", String(quality));
    if (width) fd.append("width", String(width));
    if (height) fd.append("height", String(height));
    if (dpi) fd.append("dpi", String(dpi));
    if (scale) fd.append("scale", String(scale));

    const url = `${API_BASE.replace(/\/$/, "")}/${files.length === 1 ? "convert/" : "convert/batch"}`;

    const loadingToast = toast.loading("Uploading...");
    try {
      const uploadPromise = uploadFormDataWithProgress(url, fd, (pct) => setProgress(pct));
      const result = await uploadPromise;
      toast.dismiss();
      setResultBlob(result.blob);
      setResultName(result.filename);
      setProgress(100);
      toast.success("Conversion complete");
    } catch (err) {
      console.error(err);
      toast.dismiss();
      setProgress(0);
      toast.error("Conversion failed");
    } finally {
      // ensure the processing flag is cleared so the Convert button returns to enabled state
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-8">
      <div className="mx-auto max-w-4xl">


        <Card className="mt-1">
          <CardHeader>
            <CardTitle>Image Conversion Studio</CardTitle>
            <div className="text-sm text-slate-500">Convert images between formats quickly — single or batch.</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Field>
                <FieldLabel>Source images</FieldLabel>
                <FieldDescription>Drag & drop images here or click to select files to convert.</FieldDescription>
                <div className="mt-2">
                  <UploadDropzone onFiles={onFiles} />
                </div>
              </Field>

              <Field>
                <FieldLabel>Selected files</FieldLabel>
                <FieldDescription>{files.length === 0 ? "No files selected." : `${files.length} file${files.length > 1 ? "s" : ""}`}</FieldDescription>
                <div className="mt-2">
                  <FileList items={files} onRemove={removeFile} />
                </div>
              </Field>
              <FieldSeparator />

              <FieldGroup>
                <FieldSet>
                  <FieldLegend>Conversion</FieldLegend>
                  <FieldDescription>Choose output format and quality settings.</FieldDescription>
                  <FieldGroup>
                    <Field>
                      <FieldLabel>Target format</FieldLabel>
                      <div className="mt-1">
                        <Select onValueChange={(v: string) => setTargetFormat(v as ImageFormat)}>
                          <SelectTrigger className="w-full">
                            <SelectValue>{String(targetFormat).toUpperCase()}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(ImageFormat).map((fmt) => (
                              <SelectItem key={fmt} value={fmt}>
                                {fmt.toUpperCase()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </Field>

                    <Field>
                      <FieldLabel>Quality (1-100)</FieldLabel>
                      <Input
                        type="number"
                        className="mt-1"
                        value={quality ?? ""}
                        onChange={(e) => setQuality(e.target.value ? Number(e.target.value) : undefined)}
                        disabled={!isLossy}
                        min={1}
                        max={100}
                        placeholder=""
                        aria-label="Quality"
                      />
                      <FieldDescription>{isLossy ? "Lossy formats only" : "Disabled unless a lossy format (jpeg, webp, avif, heic) is chosen"}</FieldDescription>
                    </Field>

                    <Field orientation="horizontal">
                      <div className="flex-1" />
                      <div className="w-40">
                        <Button className="w-full" onClick={submit} disabled={isProcessing || convertMutation.loading || batchMutation.loading}>
                          {isProcessing || convertMutation.loading || batchMutation.loading || progress > 0 ? (
                            <span className="flex items-center justify-center gap-2">
                              <Spinner /> <span>Converting</span>
                            </span>
                          ) : (
                            <span>Convert {files.length > 1 ? `(${files.length})` : ""}</span>
                          )}
                        </Button>
                      </div>
                    </Field>
                  </FieldGroup>
                </FieldSet>
                <FieldSeparator />
              </FieldGroup>

              <FieldSet>
                <FieldLegend>Size & scale</FieldLegend>
                <FieldDescription>Optional size and resolution settings for output images (leave blank to keep original).</FieldDescription>
                <FieldGroup>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Field>
                      <FieldLabel>Width (px)</FieldLabel>
                      <Input
                        type="number"
                        className="mt-1"
                        value={width ?? ""}
                        onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="auto"
                        min={1}
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Height (px)</FieldLabel>
                      <Input
                        type="number"
                        className="mt-1"
                        value={height ?? ""}
                        onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="auto"
                        min={1}
                      />
                    </Field>

                    <Field>
                      <FieldLabel>DPI (SVG)</FieldLabel>
                      <Input
                        type="number"
                        className="mt-1"
                        value={dpi ?? ""}
                        onChange={(e) => setDpi(e.target.value ? Number(e.target.value) : undefined)}
                        disabled={!isSvg}
                        placeholder="e.g. 96"
                        min={1}
                        aria-label="DPI"
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Scale (SVG)</FieldLabel>
                      <Input
                        type="number"
                        step="0.1"
                        className="mt-1"
                        value={scale ?? ""}
                        onChange={(e) => setScale(e.target.value ? Number(e.target.value) : undefined)}
                        disabled={!isSvg}
                        placeholder="e.g. 1.0"
                        min={0.1}
                        aria-label="Scale"
                      />
                    </Field>
                  </div>
                </FieldGroup>
              </FieldSet>

              <div>
                <div className="mb-2 text-sm text-slate-600">{convertMutation.loading || batchMutation.loading ? "Processing" : "Progress"}</div>
                <Progress value={progress} />
                <div className="mt-1 text-xs text-slate-500">{Math.max(0, Math.min(100, Math.round(progress)))}%</div>
              </div>

              {resultBlob && resultName ? (
                <ResultDownload result={{ type: files.length > 1 ? "zip" : "single", fileName: resultName, blob: resultBlob }} />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

