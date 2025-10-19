type ProgressCallback = (percent: number) => void;

export interface UploadResult {
  blob: Blob;
  filename: string;
}

/**
 * Parse Content-Disposition header robustly including RFC5987 filename*=UTF-8''...
 */
export function parseContentDispositionFilename(
  cd: string | null
): string | null {
  if (!cd) return null;

  // Try RFC5987: filename*=UTF-8''%e2%82%ac%20rates.pdf
  const rfc5987 = /filename\*=(?:UTF-8'')?([^;\n]+)/i.exec(cd);
  if (rfc5987 && rfc5987[1]) {
    try {
      // Remove surrounding quotes if present
      let val = rfc5987[1].trim();
      if (val.startsWith("'")) val = val.slice(1);
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      // decode percent-encoding
      return decodeURIComponent(val.replace(/"/g, ""));
    } catch (e) {
      return rfc5987[1];
    }
  }

  // Fallback to simple filename="..." or filename=token
  const simple = /filename=\s*\"?([^\";]+)\"?/i.exec(cd);
  if (simple && simple[1]) return simple[1];

  return null;
}

/**
 * Upload FormData via XHR and return response blob and filename if available.
 * Progress callback receives 0-100 percentage.
 */
export function uploadFormDataWithProgress(
  url: string,
  form: FormData,
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    // Note: API key must be injected server-side via the proxy.
    // Do NOT set any X-API-Key header here to avoid exposing secrets in the client.
    xhr.responseType = "blob";

    if (signal) {
      if (signal.aborted) return reject(new Error("Aborted"));
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Aborted"));
      });
    }

    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = Math.round((e.loaded / e.total) * 50);
      if (onProgress) onProgress(pct);
    };

    xhr.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const pct = 50 + Math.round((e.loaded / e.total) * 50);
      if (onProgress) onProgress(pct);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response as Blob;
        const cd = xhr.getResponseHeader("Content-Disposition");
        const filename = parseContentDispositionFilename(cd) ?? "download";
        if (onProgress) onProgress(100);
        resolve({ blob, filename });
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));

    xhr.send(form);
  });
}
