import { afterEach, describe, expect, it, vi } from "vitest";
import { putWithProgress, readMediaMetadata } from "./upload";

class FakeXHR {
  static last: FakeXHR;
  status = 200;
  upload = { onprogress: null as null | ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) };
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  headers: Record<string, string> = {};
  open() { FakeXHR.last = this; }
  setRequestHeader(k: string, v: string) { this.headers[k] = v; }
  send() {
    this.upload.onprogress?.({ lengthComputable: true, loaded: 50, total: 100 });
    setTimeout(() => this.onload?.(), 0);
  }
}

describe("upload helpers", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("rejects unsupported file types before contacting the API", async () => {
    await expect(readMediaMetadata(new File(["x"], "notes.txt", { type: "text/plain" }))).rejects.toMatchObject({ code: "UNSUPPORTED_TYPE" });
  });

  it("returns empty metadata for PDFs (pages are counted by the worker)", async () => {
    await expect(readMediaMetadata(new File(["%PDF"], "doc.pdf", { type: "application/pdf" }))).resolves.toEqual({});
  });

  it("PUTs the file with its content type and reports progress", async () => {
    vi.stubGlobal("XMLHttpRequest", FakeXHR);
    const progress: number[] = [];
    await putWithProgress("http://storage/upload", new File(["abc"], "a.png", { type: "image/png" }), (p) => progress.push(p));
    expect(FakeXHR.last.headers["Content-Type"]).toBe("image/png");
    expect(progress).toEqual([50]);
  });

  it("rejects when storage refuses the upload", async () => {
    vi.stubGlobal("XMLHttpRequest", class extends FakeXHR { status = 403; });
    await expect(putWithProgress("http://storage/upload", new File(["abc"], "a.png", { type: "image/png" }), () => {})).rejects.toMatchObject({ code: "UPLOAD_FAILED", status: 403 });
  });
});
