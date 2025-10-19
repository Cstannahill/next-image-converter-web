import { vi, describe, it, expect } from "vitest";
import {
  uploadFormDataWithProgress,
  parseContentDispositionFilename,
} from "../upload";

describe("parseContentDispositionFilename", () => {
  it("parses RFC5987 filename*", () => {
    const header = "attachment; filename*=UTF-8''%E2%82%AC%20rates.pdf";
    const filename = parseContentDispositionFilename(header);
    expect(filename).toBe("€ rates.pdf");
  });

  it("parses simple filename", () => {
    const header = 'attachment; filename="hello.png"';
    expect(parseContentDispositionFilename(header)).toBe("hello.png");
  });
});

describe("uploadFormDataWithProgress", () => {
  it("reports progress and resolves with blob and filename", async () => {
    // Mock XMLHttpRequest
    const MockXHR: any = vi.fn(() => {
      return {
        open: vi.fn(),
        send: function () {
          // simulate upload progress
          (this.upload as any) = this.upload || {};
          const up = (this.upload as any).onprogress as
            | ((e: any) => void)
            | undefined;
          if (up) up({ lengthComputable: true, loaded: 50, total: 100 });

          // simulate download progress
          const onprog = (this as any).onprogress as
            | ((e: any) => void)
            | undefined;
          if (onprog)
            onprog({ lengthComputable: true, loaded: 50, total: 100 });

          // simulate headers and response
          (this as any).status = 200;
          (this as any).getResponseHeader = (name: string) =>
            'attachment; filename="server-file.png"';
          (this as any).response = new Blob(["ok"], { type: "image/png" });
          const onload = (this as any).onload as (() => void) | undefined;
          if (onload) onload();
        },
        set responseType(val: any) {},
        get responseType() {
          return "blob";
        },
        upload: {},
        onprogress: undefined,
        onload: undefined,
        onerror: undefined,
        getResponseHeader: vi.fn(),
      };
    });

    // assign mock
    (globalThis as any).XMLHttpRequest = MockXHR;

    const progressEvents: number[] = [];

    const fd = new FormData();
    fd.append("file", new File(["a"], "a.png"));

    const res = await uploadFormDataWithProgress(
      "http://example.test/upload",
      fd,
      (p) => progressEvents.push(p)
    );

    expect(res.filename).toBe("server-file.png");
    expect(res.blob).toBeInstanceOf(Blob);
    expect(progressEvents.length).toBeGreaterThanOrEqual(1);
  });

  it("rejects when server returns error", async () => {
    const MockXHR: any = vi.fn(() => ({
      open: vi.fn(),
      send: function () {
        (this as any).status = 500;
        const onload = (this as any).onload as (() => void) | undefined;
        if (onload) onload();
      },
      set responseType(val: any) {},
      get responseType() {
        return "blob";
      },
      upload: {},
      onprogress: undefined,
      onload: undefined,
      onerror: undefined,
      getResponseHeader: vi.fn(),
    }));
    (globalThis as any).XMLHttpRequest = MockXHR;

    const fd2 = new FormData();
    fd2.append("file", new File(["a"], "a.png"));

    await expect(
      uploadFormDataWithProgress("http://ex", fd2)
    ).rejects.toThrow();
  });

  it("aborts when signal is used", async () => {
    // Create an XHR that doesn't call onload to mimic hanging
    const MockXHR: any = vi.fn(() => ({
      open: vi.fn(),
      send: function () {
        // do nothing
      },
      set responseType(val: any) {},
      get responseType() {
        return "blob";
      },
      upload: {},
      onprogress: undefined,
      onload: undefined,
      onerror: undefined,
      getResponseHeader: vi.fn(),
      abort: vi.fn(),
    }));
    (globalThis as any).XMLHttpRequest = MockXHR;

    const controller = new AbortController();
    const fd3 = new FormData();
    fd3.append("file", new File(["a"], "a.png"));

    const p = uploadFormDataWithProgress(
      "http://ex",
      fd3,
      undefined,
      controller.signal
    );
    controller.abort();
    await expect(p).rejects.toThrow();
  });
});
